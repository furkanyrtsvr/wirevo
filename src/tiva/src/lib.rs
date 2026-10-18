//! Independent TM4C123 bridge. The shared ARM instruction engine is not an STM32 peripheral alias.
use zmu_cortex_m::{Processor,bus::Bus,core::{fault::Fault,reset::Reset,register::{BaseReg,Reg}},executor::Executor,memory::ram::RAM,peripheral::nvic::NVIC};
#[link(wasm_import_module="tiva")]
unsafe extern "C" {fn read(a:u32,n:u32)->u32;fn write(a:u32,v:u32,n:u32);fn clock(c:f64);fn irq(bank:u32)->u32;fn reset();}
pub struct TivaCPU{cpu:Processor,previous:[u32;3]}
struct Device;
impl Bus for Device{
 fn in_range(&self,a:u32)->bool{(0x40000000..0x60000000).contains(&a)}
 fn read32(&mut self,a:u32)->Result<u32,Fault>{Ok(unsafe{read(a,4)})}
 fn read16(&self,a:u32)->Result<u16,Fault>{Ok(unsafe{read(a,2)}as u16)}
 fn read8(&self,a:u32)->Result<u8,Fault>{Ok(unsafe{read(a,1)}as u8)}
 fn write32(&mut self,a:u32,v:u32)->Result<(),Fault>{unsafe{write(a,v,4)};Ok(())}
 fn write16(&mut self,a:u32,v:u16)->Result<(),Fault>{unsafe{write(a,v as u32,2)};Ok(())}
 fn write8(&mut self,a:u32,v:u8)->Result<(),Fault>{unsafe{write(a,v as u32,1)};Ok(())}
}
#[unsafe(no_mangle)]pub extern "C" fn allocate(n:usize)->*mut u8{Box::into_raw(vec![0u8;n].into_boxed_slice())as *mut u8}
#[unsafe(no_mangle)]pub unsafe extern "C" fn deallocate(p:*mut u8,n:usize){unsafe{drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(p,n)))}}
#[unsafe(no_mangle)]pub unsafe extern "C" fn create(p:*const u8,n:usize)->*mut TivaCPU{if !(8..=262144).contains(&n){return std::ptr::null_mut();}let mut data=vec![255;262144];data[..n].copy_from_slice(unsafe{std::slice::from_raw_parts(p,n)});let mut c=Processor::new();c.sram=RAM::new(0x20000000,32768);c.flash_memory(262144,&data).device(Some(Box::new(Device)));c.fault_trap_mode(zmu_cortex_m::core::fault::FaultTrapMode::hardfault());c.cache_instructions();if c.reset().is_err(){return std::ptr::null_mut();}c.running=true;Box::into_raw(Box::new(TivaCPU{cpu:c,previous:[0;3]}))}
#[unsafe(no_mangle)]pub unsafe extern "C" fn destroy(p:*mut TivaCPU){unsafe{drop(Box::from_raw(p))}}
#[unsafe(no_mangle)]pub unsafe extern "C" fn step(p:*mut TivaCPU,n:u32)->u32{let state=unsafe{&mut *p};let c=&mut state.cpu;let previous=&mut state.previous;for _ in 0..n{unsafe{clock(c.cycle_count as f64)};if c.aircr&4!=0{c.aircr=0;c.vtor=0;c.nvic_interrupt_enabled=[0;16];c.nvic_interrupt_pending=[0;16];let _=c.write32(0xe000e010,0);if c.reset().is_err(){return 1;}unsafe{reset()};}for bank in 0..3{let bits=unsafe{irq(bank)};let i=bank as usize;let falling=previous[i]&!bits;if falling!=0{c.nvic_write_icpr(i,falling);}if bits!=0{c.nvic_write_ispr(i,bits);}previous[i]=bits;}if c.sleeping{c.advance_cycles(1);c.step_sleep();}else{c.step();}if c.take_pending_fault_trap().is_some()||!c.running{return 1;}}unsafe{clock(c.cycle_count as f64)};0}
#[unsafe(no_mangle)]pub unsafe extern "C" fn cycles(p:*const TivaCPU)->f64{unsafe{(*p).cpu.cycle_count as f64}}
#[unsafe(no_mangle)]pub unsafe extern "C" fn register(p:*const TivaCPU,r:u32)->u32{let c=unsafe{&(*p).cpu};match r{0..=12=>c.get_r(match r{0=>Reg::R0,1=>Reg::R1,2=>Reg::R2,3=>Reg::R3,4=>Reg::R4,5=>Reg::R5,6=>Reg::R6,7=>Reg::R7,8=>Reg::R8,9=>Reg::R9,10=>Reg::R10,11=>Reg::R11,_=>Reg::R12}),13=>c.get_r(Reg::SP),14=>c.get_r(Reg::LR),_=>c.get_r(Reg::PC)}}
#[unsafe(no_mangle)]pub unsafe extern "C" fn memory_read(p:*mut TivaCPU,a:u32)->u32{unsafe{(*p).cpu.read32(a).unwrap_or(0)}}
#[unsafe(no_mangle)]pub unsafe extern "C" fn memory_write(p:*mut TivaCPU,a:u32,v:u32)->u32{u32::from(unsafe{(*p).cpu.write32(a,v).is_ok()})}
