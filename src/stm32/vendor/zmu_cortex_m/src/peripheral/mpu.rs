//!
//! Cortex Memory Protection Unit simulation
//!

use crate::Processor;
use crate::core::fault::Fault;

impl Processor {
    pub(crate) fn mpu_permits(&self, address:u32, size:u32, write:bool, execute:bool, unpriv:bool)->bool {
        let privileged=!unpriv&&self.current_mode_is_privileged();
        if (0xe000_0000..0xe010_0000).contains(&address){return privileged;}
        if !cfg!(feature="armv7em")||self.mpu_ctrl&1==0{return true;}
        if self.execution_priority<0&&self.mpu_ctrl&2==0{return true;}
        for region in (0..8).rev(){
            let attr=self.mpu_attr[region];if attr&1==0{continue;}
            let exponent=((attr>>1)&31)+1;if exponent<5{continue;}
            let length=1u64<<exponent;let base=(self.mpu_base[region] as u64)&!(length-1);
            let a=address as u64;if a<base||a+size as u64>base+length{continue;}
            if length>=256{let sub=((a-base)/(length/8)) as u32;if attr&(1<<(8+sub))!=0{continue;}}
            if execute&&attr&(1<<28)!=0{return false;}
            return match (attr>>24)&7 {1=>privileged,2=>privileged||!write,3=>true,5=>privileged&&!write,6=>!write,_=>false};
        }
        privileged&&self.mpu_ctrl&4!=0
    }
    pub(crate) fn mpu_read(&self,address:u32)->u32 {
        if !cfg!(feature="armv7em"){return 0;}
        match address {0xe000_ed90=>8<<8,0xe000_ed94=>self.mpu_ctrl,0xe000_ed98=>self.mpu_region as u32,
            0xe000_ed9c..=0xe000_edb8=>{let offset=address-0xe000_ed9c;let i=if offset<8{self.mpu_region}else{(self.mpu_region&!3)+((offset/8) as usize)};if i>=8{return 0;}if offset%8==0{self.mpu_base[i]|i as u32}else{self.mpu_attr[i]}},_=>0}
    }
    pub(crate) fn mpu_write(&mut self,address:u32,value:u32){
        if !cfg!(feature="armv7em"){return;}
        match address {0xe000_ed94=>self.mpu_ctrl=value&7,0xe000_ed98=>{if value<8{self.mpu_region=value as usize;}},
            0xe000_ed9c..=0xe000_edb8=>{let offset=address-0xe000_ed9c;let mut i=if offset<8{self.mpu_region}else{(self.mpu_region&!3)+(offset/8) as usize};if offset%8==0&&value&16!=0{i=(value&15) as usize;if i<8{self.mpu_region=i;}}if i<8{if offset%8==0{self.mpu_base[i]=value&!31;}else{self.mpu_attr[i]=value&0x173f_ff3f;}}},_=>()}
        self.invalidate_instruction_cache();
    }
}

/// Memory access type for MPU validation.
#[derive(Copy, Clone)]
pub enum AccType {
    /// Privileged data access.
    Normal,
    /// Unprivileged data access.
    UnPriv,
}

/// Register API for MPU address validation.
pub trait Mpu {
    ///
    /// Validate memory access at `address`.
    ///
    fn validate_address(
        &mut self,
        address: u32,
        acctype: AccType,
        write: bool,
    ) -> Result<u32, Fault>;
}

impl Mpu for Processor {
    fn validate_address(
        &mut self,
        address: u32,
        acctype: AccType,
        write: bool,
    ) -> Result<u32, Fault> {
        if self.mpu_permits(address,1,write,false,matches!(acctype,AccType::UnPriv)){Ok(address)}else{Err(Fault::DAccViol)}
    }
}

#[cfg(test)]
mod tests {
    use super::{AccType, Mpu};
    use crate::Processor;

    #[test]
    fn test_validate_address_returns_input_for_privileged_and_unprivileged_access() {
        let mut processor = Processor::new();

        assert_eq!(
            processor
                .validate_address(0x2000_0100, AccType::Normal, false)
                .unwrap(),
            0x2000_0100
        );
        assert_eq!(
            processor
                .validate_address(0x2000_0200, AccType::UnPriv, true)
                .unwrap(),
            0x2000_0200
        );
    }
}
