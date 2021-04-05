const isObject = val => typeof val === 'object'

function objProtect(obj, fn) {
	const returnObj = fn(obj)
	if (Array.isArray(returnObj))
		return [...returnObj]
	else if (isObject(returnObj))
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

export const recursion = fn => (...variables) => {
	try {
		while (true)
			variables = fn(...variables)
	} catch (returnData) {
		return returnData
	}
}

export const lazy = fn => {
	let obj
	return () => {
		obj = obj ?? fn()
		return Object.freeze(obj)
	}
}

export const memoize = fn => {
	const mem = new Map()
	return (...variable) => {
		const val = JSON.stringify(variable)
		if (mem.has(val))
			return mem.get(val)
		else
			return mem.set(val, fn(...variable)).get(val)
	}
}