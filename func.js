export const piping = (val, ...fn) => fn.reduce((v, f) => f(v), val)

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
	let cache
	return () => {
		cache = cache ?? fn()
		return cache
	}
}

export const memoize = fn => {
	const cache = new Map()
	return (...variable) => {
		const val = JSON.stringify(variable)
		if (cache.has(val))
			return cache.get(val)
		else
			return cache.set(val, fn(...variable)).get(val)
	}
}

const recIs = (obj1, obj2) => {
	if (Object.keys(obj1).length !== Object.keys(obj2).length)
		throw false
	for (const val in obj1) {
		if (typeof obj1[val] === 'object')
			recIs(obj1[val], obj2[val])
		else if (!obj2.hasOwnProperty(val))
			throw false
	}
	return true
}

export const is = (obj1, obj2) => {
	try {
		return recIs(obj1, obj2)
	} catch (val) {
		return val
	}
}

const recIsEqual = (obj1, obj2) => {
	if (Object.keys(obj1).length !== Object.keys(obj2).length)
		throw false
	for (const val in obj1) {
		if (typeof obj1[val] === 'object')
			recIsEqual(obj1[val], obj2[val])
		else if (obj1[val] !== obj2[val])
			throw false
	}
	return true
}


export const isEqual = (obj1, obj2) => {
	try {
		return recIsEqual(obj1, obj2)
	} catch (val) {
		return val
	}
}
