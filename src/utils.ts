export function randomInterval ( mmin: number, mmax: number ) {
	return mmin + Math.random() * ( mmax - mmin );
}
export function deepClone ( obj: any ): any {
	if ( obj === null || typeof obj !== 'object' ) {
		return obj;
	}

	const clonedObj: any = Array.isArray( obj ) ? [] : {};

	for ( let key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			clonedObj[ key ] = deepClone( obj[ key ] );
		}
	}

	return clonedObj;
}

export function circleAnnulusSampling(): {x: number, y: number} {
	while(true) {
		const x = randomInterval(-2, 2);
		const y = randomInterval(-2, 2);
		
		const d = Math.sqrt( x * x + y * y);
		
		if (d >= 1 && d < 2) return { x, y};
	}
	return {x: -1, y: -1};
}

export function sphereAnnulusSampling(): {x: number, y: number, z: number} {
	while(true) {
		const x = randomInterval(-2, 2);
		const y = randomInterval(-2, 2);
		const z = randomInterval(-2, 2);
		
		const d = Math.sqrt( x * x + y * y + z * z);
		
		if (d >= 1 && d < 2) return { x, y, z};
	}
	return {x: -1, y: -1, z: -1};
}