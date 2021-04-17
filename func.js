export const piping = (obj) => ({
	pipe: (fn) => piping(fn(Object.freeze(obj))),
	valueOf: () => obj,
})

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

export const is = (obj1, obj2) => {
	if (Object.keys(obj1).length !== Object.keys(obj2).length)
		return false
	for (const val in obj1)
		if (!obj2.hasOwnProperty(val))
			return false
	return true
}

export const isEqual = (obj1, obj2) => {
	if (Object.keys(obj1).length !== Object.keys(obj2).length)
		return false
	for (const val in obj1)
		if (obj1[val] !== obj2[val])
			return false
	return true
}
