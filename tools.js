function objProtect(obj, fn) {
	if (Array.isArray(obj))
		return [...fn(obj)]
	else if (typeof obj === 'object')
		return { ...obj, ...fn(obj) }
	else
		return fn(obj)
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
