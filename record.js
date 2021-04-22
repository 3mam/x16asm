export const tokenData = (obj = { token: '', srcFile: '', line: 0, column: 0, type: 0 }) => ({
	token: token => tokenData({ ...obj, token }),
	srcFile: srcFile => tokenData({ ...obj, srcFile }),
	line: line => tokenData({ ...obj, line }),
	column: column => tokenData({ ...obj, column }),
	type: type => tokenData({ ...obj, type }),
	valueOf: () => obj,
})

export const instructionData = (obj = { name: '', value: [0], type: 0 }) => ({
	name: name => instructionData({ ...obj, name }),
	value: value => instructionData({ ...obj, value }),
	type: type => instructionData({ ...obj, type }),
	valueOf: () => obj,
})