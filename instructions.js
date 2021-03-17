export const cpuInstructions = {
	adc: {
		immediate: 0x69,
		zeroPage: 0x65,
		zeroPageX: 0x75,
		absolute: 0x6D,
		absoluteX: 0x7D,
		absoluteY: 0x79,
		indirectX: 0x61,
		indirectY: 0x71,
		indZeroPage: 0x72,
	},
	and: {
		immediate: 0x29,
		zeroPage: 0x25,
		zeroPageX: 0x35,
		absolute: 0x2D,
		absoluteX: 0x3D,
		absoluteY: 0x39,
		indirectX: 0x21,
		indirectY: 0x31,
		indZeroPage: 0x32,
	},
	asl: {
		accumulator: 0x0A,
		zeroPage: 0x06,
		zeroPageX: 0x16,
		absolute: 0x0E,
		absoluteX: 0x1E,
	},
	bbr0: {
		relative: 0x0F
	},
	bbr1: {
		relative: 0x1F
	},
	bbr2: {
		relative: 0x2F
	},
	bbr3: {
		relative: 0x3F
	},
	bbr4: {
		relative: 0x4F
	},
	bbr5: {
		relative: 0x5F
	},
	bbr6: {
		relative: 0x6F
	},
	bbr7: {
		relative: 0x7F
	},
	bbs0: {
		relative: 0x8F
	},
	bbs1: {
		relative: 0x9F
	},
	bbs2: {
		relative: 0xAF
	},
	bbs3: {
		relative: 0xBF
	},
	bbs4: {
		relative: 0xCF
	},
	bbs5: {
		relative: 0xDF
	},
	bbs6: {
		relative: 0xEF
	},
	bbs7: {
		relative: 0xFF
	},
	bcc: {
		relative: 0x90
	},
	bcs: {
		relative: 0xB0
	},
	beq: {
		relative: 0xF0
	},
	bit: {
		immediate: 0x89,
		zeroPage: 0x24,
		zeroPageX: 0x34,
		absolute: 0x2C,
		absoluteX: 0x3C,
	},
	bmi: {
		relative: 0x30
	},
	bne: {
		relative: 0xD0
	},
	bpl: {
		relative: 0x10
	},
	bra: {
		relative: 0x80
	},
	brk: {
		implied: 0x00
	},
	bvc: {
		relative: 0x50
	},
	bvs: {
		relative: 0x70
	},
	clc: {
		implied: 0x18
	},
	cld: {
		implied: 0xD8
	},
	cli: {
		implied: 0x58
	},
	clv: {
		implied: 0xB8
	},
	cmp: {
		immediate: 0xC9,
		zeroPage: 0xC5,
		zeroPageX: 0xD5,
		absolute: 0xCD,
		absoluteX: 0xDD,
		absoluteY: 0xD9,
		indirectX: 0xC1,
		indirectY: 0xD1,
		indZeroPage: 0xD2,
	},
	cpx: {
		immediate: 0xE0,
		zeroPage: 0xE4,
		absolute: 0xEC,
	},
	cpy: {
		immediate: 0xC0,
		zeroPage: 0xC4,
		absolute: 0xCC,
	},
	dec: {
		accumulator: 0x3A,
		zeroPage: 0xC6,
		zeroPageX: 0xD6,
		absolute: 0xCE,
		absoluteX: 0xDE,
	},
	dex: {
		implied: 0xCA
	},
	dey: {
		implied: 0x88
	},
	eor: {
		immediate: 0x49,
		zeroPage: 0x45,
		zeroPageX: 0x55,
		absolute: 0x4D,
		absoluteX: 0x5D,
		absoluteY: 0x59,
		indirectX: 0x41,
		indirectY: 0x51,
		indZeroPage: 0x52,
	},
	inc: {
		accumulator: 0x1A,
		zeroPage: 0xE6,
		zeroPageX: 0xF6,
		absolute: 0xEE,
		absoluteX: 0xFE,
	},
	inx: {
		implied: 0xE8
	},
	iny: {
		implied: 0xC8
	},
	jmp: {
		absolute: 0x4C,
		indirect: 0x6C,
		absoluteX: 0x7C,
	},
	jsr: {
		absolute: 0x20
	},
	lda: {
		immediate: 0xA9,
		zeroPage: 0xA5,
		zeroPageX: 0xB5,
		absolute: 0xAD,
		absoluteX: 0xBD,
		absoluteY: 0xB9,
		indirectX: 0xA1,
		indirectY: 0xB1,
		indZeroPage: 0xB2,
	},
	ldx: {
		immediate: 0xA2,
		zeroPage: 0xA6,
		zeroPageY: 0xB6,
		absolute: 0xAE,
		absoluteY: 0xBE,
	},
	ldy: {
		immediate: 0xA0,
		zeroPage: 0xA4,
		zeroPageX: 0xB4,
		absolute: 0xAC,
		absoluteX: 0xBC,
	},
	lsr: {
		accumulator: 0x4A,
		zeroPage: 0x46,
		zeroPageX: 0x56,
		absolute: 0x4E,
		absoluteX: 0x5E,
	},
	nop: {
		implied: 0xEA
	},
	ora: {
		immediate: 0x09,
		zeroPage: 0x05,
		zeroPageX: 0x15,
		absolute: 0x0D,
		absoluteX: 0x1D,
		absoluteY: 0x19,
		indirectX: 0x01,
		indirectY: 0x11,
		indZeroPage: 0x12,
	},
	pha: {
		implied: 0x48
	},
	php: {
		implied: 0x08
	},
	phx: {
		implied: 0xDA
	},
	phy: {
		implied: 0x5A
	},
	pla: {
		implied: 0x68
	},
	plp: {
		implied: 0x28
	},
	plx: {
		implied: 0xFA
	},
	ply: {
		implied: 0x7A
	},
	rmb0: {
		zeroPage: 0x07
	},
	rmb1: {
		zeroPage: 0x17
	},
	rmb2: {
		zeroPage: 0x27
	},
	rmb3: {
		zeroPage: 0x37
	},
	rmb4: {
		zeroPage: 0x47
	},
	rmb5: {
		zeroPage: 0x57
	},
	rmb6: {
		zeroPage: 0x67
	},
	rmb7: {
		zeroPage: 0x77
	},
	rol: {
		accumulator: 0x2A,
		zeroPage: 0x26,
		zeroPageX: 0x36,
		absolute: 0x2E,
		absoluteX: 0x3E,
	},
	ror: {
		accumulator: 0x6A,
		zeroPage: 0x66,
		zeroPageX: 0x76,
		absolute: 0x6E,
	},
	rti: {
		implied: 0x40
	},
	rts: {
		implied: 0x60
	},
	sbc: {
		immediate: 0xE9,
		zeroPage: 0xE5,
		zeroPageX: 0xF5,
		absolute: 0xED,
		absoluteX: 0xFD,
		absoluteY: 0xF9,
		indirectX: 0xE1,
		indirectY: 0xF1,
		indZeroPage: 0xF2,
	},
	sec: {
		implied: 0x38
	},
	sed: {
		implied: 0xF8
	},
	sei: {
		implied: 0x78
	},
	smb0: {
		zeroPage: 0x87
	},
	smb1: {
		zeroPage: 0x97
	},
	smb2: {
		zeroPage: 0xA7
	},
	smb3: {
		zeroPage: 0xB7
	},
	smb4: {
		zeroPage: 0xC7
	},
	smb5: {
		zeroPage: 0xD7
	},
	smb6: {
		zeroPage: 0xE7
	},
	smb7: {
		zeroPage: 0xF7
	},
	sta: {
		zeroPage: 0x85,
		zeroPageX: 0x95,
		absolute: 0x8D,
		absoluteX: 0x9D,
		absoluteY: 0x99,
		indirectX: 0x81,
		indirectY: 0x91,
		indZeroPage: 0x92,
	},
	stp: {
		implied: 0xDB
	},
	stx: {
		zeroPage: 0x86,
		zeroPageY: 0x96,
		absolute: 0x8E,
	},
	sty: {
		zeroPage: 0x84,
		zeroPageX: 0x94,
		absolute: 0x8C,
	},
	stz: {
		zeroPage: 0x64,
		zeroPageX: 0x74,
		absolute: 0x9C,
		absoluteX: 0x9E,
	},
	tax: {
		implied: 0xAA
	},
	tay: {
		implied: 0xA8
	},
	trb: {
		zeroPage: 0x14,
		absolute: 0x1C,
	},
	tsb: {
		zeroPage: 0x04,
		absolute: 0x0C,
	},
	tsx: {
		implied: 0xBA
	},
	txa: {
		implied: 0x8A
	},
	txs: {
		implied: 0x9A
	},
	tya: {
		implied: 0x98
	},
	wai: {
		implied: 0xCB
	}
}