export const tokenData = (obj = { token: '', srcFile: '', line: 0, column: 0, type: 0 }) => ({
	token: obj.token,
	srcFile: obj.srcFile,
	line: obj.line,
	column: obj.column,
	type: obj.type,
	setToken: token => tokenData({ ...obj, token }),
	setSrcFile: srcFile => tokenData({ ...obj, srcFile }),
	setLine: line => tokenData({ ...obj, line }),
	setColumn: column => tokenData({ ...obj, column }),
	setType: type => tokenData({ ...obj, type }),
	valueOf: () => obj,
})

export const instructionData = (obj = { name: '', value: [0], type: 0 }) => ({
	name: obj.name,
	value: obj.value,
	type: obj.type,
	setName: name => instructionData({ ...obj, name }),
	setValue: value => instructionData({ ...obj, value }),
	setType: type => instructionData({ ...obj, type }),
	valueOf: () => obj,
})