//!
//! Flash Memory simulation
//!
//!

use crate::bus::Bus;
use crate::core::fault::Fault;
use byteorder::{ByteOrder, LittleEndian};

#[derive(Debug)]
/// Flash memory with configurable start address and data content
pub struct FlashMemory {
    data: Box<[u8]>,
    program_width: u8,
    status: u8,
    protected: Vec<(usize, usize)>,
}

impl FlashMemory {
    /// make a flash data instance with given start address, size and data content
    pub fn new(size: usize, new_data: &[u8]) -> Self {
        let mut data = vec![0_u8; size].into_boxed_slice();
        data.copy_from_slice(new_data);

        Self { data, program_width: 0, status: 0, protected: Vec::new() }
    }

    /// Get the length
    pub fn len(&self) -> usize {
        self.data.len()
    }

    /// check if the memory is empty
    pub fn is_empty(&self) -> bool {
        self.data.len() == 0
    }

    /// Enable a single physical Flash programming width. Zero locks programming.
    pub fn set_program_width(&mut self, width: u8) {
        self.program_width = width;
    }

    /// Abstract controller status: bit 0 programming/sequence, bit 1 alignment.
    pub fn status(&self) -> u8 { self.status }
    /// Clear selected abstract controller status flags.
    pub fn clear_status(&mut self, mask: u8) { self.status &= !mask; }

    /// Remove ranges before reloading the reset-latched option bytes.
    pub fn protection_clear(&mut self) { self.protected.clear(); }
    /// Deny programming and erasure for an option-byte protected range.
    pub fn protect(&mut self, start: usize, length: usize) {
        self.protected.push((start, start.saturating_add(length)));
    }
    fn write_protected(&self, start: usize, length: usize) -> bool {
        self.protected.iter().any(|&(a,b)| start < b && start.saturating_add(length) > a)
    }

    /// Erase a checked range to the physical erased value.
    pub fn erase(&mut self, start: usize, length: usize) -> bool {
        if self.write_protected(start, length) { self.status |= 8; return false; }
        if start.checked_add(length).is_none_or(|end| end > self.data.len()) {
            self.status |= 1;
            return false;
        }
        self.data[start..start + length].fill(0xff);
        self.status |= 4;
        true
    }

    /// Copy the current non-volatile contents into a host snapshot.
    pub fn copy_to(&self, target: &mut [u8]) -> usize {
        let length = target.len().min(self.data.len());
        target[..length].copy_from_slice(&self.data[..length]);
        length
    }

    fn program(&mut self, addr: usize, bytes: &[u8]) -> Result<(), Fault> {
        if self.write_protected(addr, bytes.len()) { self.status |= 8; return Ok(()); }
        if self.program_width as usize != bytes.len() {
            self.status |= if self.program_width == 0 { 1 } else { 2 };
            return Ok(());
        }
        if addr % bytes.len() != 0 || addr.checked_add(bytes.len()).is_none_or(|end| end > self.data.len()) {
            self.status |= 2;
            return Ok(());
        }
        if bytes.iter().enumerate().any(|(i, value)| self.data[addr + i] & value != *value) {
            self.status |= 1;
            return Ok(());
        }
        for (i, value) in bytes.iter().enumerate() { self.data[addr + i] &= value; }
        self.status |= 4;
        Ok(())
    }
}

impl Bus for FlashMemory {
    #[inline(always)]
    fn read8(&self, addr: u32) -> Result<u8, Fault> {
        let a = addr as usize;
        Ok(self.data[a])
    }
    #[inline(always)]
    fn read16(&self, addr: u32) -> Result<u16, Fault> {
        let a = addr as usize;

        Ok(LittleEndian::read_u16(&self.data[a..a + 2]))
    }

    #[inline(always)]
    fn read32(&mut self, addr: u32) -> Result<u32, Fault> {
        let a = addr as usize;
        Ok(LittleEndian::read_u32(&self.data[a..a + 4]))
    }

    #[inline(always)]
    fn write32(&mut self, addr: u32, value: u32) -> Result<(), Fault> {
        self.program(addr as usize, &value.to_le_bytes())
    }

    #[inline(always)]
    fn write16(&mut self, addr: u32, value: u16) -> Result<(), Fault> {
        self.program(addr as usize, &value.to_le_bytes())
    }
    #[inline(always)]
    fn write8(&mut self, addr: u32, value: u8) -> Result<(), Fault> {
        self.program(addr as usize, &[value])
    }

    #[inline(always)]
    fn in_range(&self, addr: u32) -> bool {
        addr < (self.data.len() as u32)
    }
}

#[test]
fn test_new() {
    // should be able to make new instance of memory
    let data = [0; 1024];
    let _mem = FlashMemory::new(1024, &data);
}

#[test]
fn test_load() {
    let mut mem = FlashMemory::new(1024, &vec![42u8; 1024]);
    assert_eq!(mem.read8(0).unwrap(), 42);
    assert_eq!(mem.read16(0).unwrap(), (42 << 8) + 42);
    assert_eq!(
        mem.read32(0).unwrap(),
        (42 << 24) + (42 << 16) + (42 << 8) + 42
    );
}

#[test]
fn test_in_range() {
    {
        /* no offset */
        let mem = FlashMemory::new(1024, &vec![0u8; 1024]);
        assert!(mem.in_range(0));
        assert!(mem.in_range(1023));
        assert!(!mem.in_range(1024));
        assert!(!mem.in_range(0xFFFF_FFFF));
    }
}
