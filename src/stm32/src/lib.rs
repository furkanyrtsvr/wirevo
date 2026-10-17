//! CircuitForge browser bridge for the genuine Zmu ARMv7-M instruction engine.
use zmu_cortex_m::peripheral::nvic::NVIC;
use zmu_cortex_m::{Processor, bus::Bus, core::{fault::Fault, reset::Reset, register::{BaseReg,Reg}}, executor::Executor, memory::{ram::RAM,map::MemoryMapConfig}};

#[link(wasm_import_module = "cf")]
unsafe extern "C" {
    fn mmio_read(address:u32, size:u32)->u32;
    fn mmio_write(address:u32, value:u32, size:u32);
    fn clock(cycles:f64);
    fn irq_pending()->u32;fn irq_extra()->u32;fn reset_request()->u32;
    fn dma_request()->u32;fn dma_source()->u32;fn dma_dest()->u32;fn dma_complete(error:u32);
}
struct Peripherals;
impl Bus for Peripherals {
    fn in_range(&self,a:u32)->bool { (0x40000000..0x60000000).contains(&a)||(0x1fff7a00..0x1fff7b00).contains(&a)||(0x1ffff7e0..0x1ffff810).contains(&a) }
    fn read32(&mut self,a:u32)->Result<u32,Fault>{Ok(unsafe{mmio_read(a,4)})}
    fn read16(&self,a:u32)->Result<u16,Fault>{Ok(unsafe{mmio_read(a,2)} as u16)}
    fn read8(&self,a:u32)->Result<u8,Fault>{Ok(unsafe{mmio_read(a,1)} as u8)}
    fn write32(&mut self,a:u32,v:u32)->Result<(),Fault>{unsafe{mmio_write(a,v,4)};Ok(())}
    fn write16(&mut self,a:u32,v:u16)->Result<(),Fault>{unsafe{mmio_write(a,v as u32,2)};Ok(())}
    fn write8(&mut self,a:u32,v:u8)->Result<(),Fault>{unsafe{mmio_write(a,v as u32,1)};Ok(())}
}

#[unsafe(no_mangle)]
pub extern "C" fn allocate(size:usize)->*mut u8 { Box::into_raw(vec![0u8;size].into_boxed_slice()) as *mut u8 }
#[unsafe(no_mangle)]
pub unsafe extern "C" fn deallocate(p:*mut u8,size:usize) {unsafe{drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(p,size)))}}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn create(p:*const u8,size:usize,flash:usize,ram:usize)->*mut Processor {
    if size>flash||flash>512*1024||ram>128*1024||size<8{return std::ptr::null_mut()}
    let mut code=vec![0xffu8;flash];code[..size].copy_from_slice(unsafe{std::slice::from_raw_parts(p,size)});
    let mut cpu=Processor::new();cpu.sram=RAM::new(0x20000000,ram);
    cpu.flash_memory(flash,&code).memory_map(Some(MemoryMapConfig::new(0x08000000,0,flash))).device(Some(Box::new(Peripherals)));
    cpu.fault_trap_mode(zmu_cortex_m::core::fault::FaultTrapMode::all());
    cpu.cache_instructions();if cpu.reset().is_err(){return std::ptr::null_mut()}cpu.running=true;
    Box::into_raw(Box::new(cpu))
}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn destroy(p:*mut Processor){unsafe{drop(Box::from_raw(p))}}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn step(p:*mut Processor,n:u32)->u32 {let cpu=unsafe{&mut *p};let mut previous=0;let mut previous_extra=0;for _ in 0..n{unsafe{clock(cpu.cycle_count as f64)};if unsafe{reset_request()}!=0 {cpu.vtor=0;cpu.nvic_interrupt_enabled=[0;16];cpu.nvic_interrupt_pending=[0;16];let _=cpu.write32(0xe000e010,0);let _=cpu.write32(0xe000e014,0);let _=cpu.write32(0xe000e018,0);if cpu.reset().is_err(){return 1;}previous=0;previous_extra=0;continue;}
let request=unsafe{dma_request()};if request!=0 {let source=unsafe{dma_source()};let dest=unsafe{dma_dest()};let value=match request&255 {1=>cpu.read8(source).map(u32::from),2=>cpu.read16(source).map(u32::from),_=>cpu.read32(source)};let result=value.and_then(|v|match request>>8 {1=>cpu.write8(dest,v as u8),2=>cpu.write16(dest,v as u16),_=>cpu.write32(dest,v)});unsafe{dma_complete(u32::from(result.is_err()))};}
let signals=unsafe{irq_pending()};if signals&0x80000000!=0{cpu.send_event();}let level=signals&0x7fffffff;
if level|previous!=0 {for (bit,irq) in [37u32,38,18,28,35,31,32,6,7,8,9,10,23,40,11,12,13,14,15,16,17,47,56,57,58,59,60,68,69,70,0].iter().enumerate(){let mask=1u32<<bit;let bank=(irq/32) as usize;let flag=1u32<<(irq%32);if level&mask!=0{cpu.nvic_write_ispr(bank,flag);}else if previous&mask!=0{cpu.nvic_write_icpr(bank,flag);}}
}previous=level;let extra=unsafe{irq_extra()};if extra|previous_extra!=0{for (bit,irq) in [3u32,41,19,20,21,22,42,67,49].iter().enumerate(){let mask=1u32<<bit;let bank=(irq/32) as usize;let flag=1u32<<(irq%32);if extra&mask!=0{cpu.nvic_write_ispr(bank,flag);}else if previous_extra&mask!=0{cpu.nvic_write_icpr(bank,flag);}}}previous_extra=extra;if cpu.sleeping{cpu.cycle_count+=1;cpu.step_sleep()}else{cpu.step()};if cpu.take_pending_fault_trap().is_some()||!cpu.running{return 1}}unsafe{clock(cpu.cycle_count as f64)};0}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn cycles(p:*const Processor)->f64{unsafe{(*p).cycle_count as f64}}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn register(p:*mut Processor,n:u16)->u32{let cpu=unsafe{&mut *p};cpu.get_r(Reg::from_u16(n).unwrap_or(Reg::PC))}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn read(p:*mut Processor,a:u32)->u32 {unsafe{&mut *p}.read8(a).map_or(0,|v|v as u32)}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn flash_program_width(p:*mut Processor,width:u32){unsafe{&mut *p}.code.set_program_width(width as u8)}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn flash_status(p:*const Processor)->u32{unsafe{(*p).code.status() as u32}}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn flash_clear_status(p:*mut Processor,mask:u32){unsafe{&mut *p}.code.clear_status(mask as u8)}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn flash_erase(p:*mut Processor,start:u32,length:u32)->u32{let cpu=unsafe{&mut *p};let erased=cpu.code.erase(start as usize,length as usize);if erased{cpu.invalidate_instruction_cache();}u32::from(erased)}
#[unsafe(no_mangle)]
pub unsafe extern "C" fn flash_copy(p:*const Processor,target:*mut u8,length:usize)->usize{
    let output=unsafe{std::slice::from_raw_parts_mut(target,length)};
    unsafe{&*p}.code.copy_to(output)
}
