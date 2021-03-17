function objProtect(obj, fn) {
	const returnObj = fn(obj)
	if (Array.isArray(returnObj))
		return [...returnObj]
	else if (typeof returnObj === 'object')
		return { ...obj, ...returnObj }
	else
		return returnObj
}

function pipe(obj) {
	Object.freeze(obj)
	this.valueOf = () => obj
	this.pipe = (fn) => new pipe(objProtect(obj, fn))
}

export const piping = obj => new pipe(obj)
export const composition = (...fn) => val => fn.reduce((v, f) => f(v), val)

export const recursion = func => (...variables) => {
	try {
		while (true)
			variables = func(...variables)
	} catch (returnData) {
		return returnData
	}
}
