export const tokenData = (obj={token: '', srcFile: '', line: 0, column: 0, type: 0}) => ({
	setToken: token => tokenData({...obj, token}),
	setSrcFile: srcFile => tokenData({...obj, srcFile}),
	setLine: line => tokenData({...obj, line}),
	setColumn: column => tokenData({...obj, column}),
	setType: type => tokenData({...obj, type}),
	valueOf: () => obj,
})