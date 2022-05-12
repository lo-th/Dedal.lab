import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

function babelCleanup() {

	const doubleSpaces = / {2}/g;

	return {

		transform( code ) {

			code = code.replace( doubleSpaces, '\t' );

			return {
				code: code,
				map: null
			};

		}

	};

}

function header() {

	return {

		renderChunk( code ) {

			return `/**
 * @license
 * Copyright 2010-2022 Ddls.js Authors lo-th
 * SPDX-License-Identifier: MIT
 */
${ code }`;

		}

	};

}



const babelrc = {
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
				targets: '>1%',
				loose: true,
				bugfixes: true,
			}
		]
	],
	plugins: [
	    [
	        "@babel/plugin-proposal-class-properties",
	        {
	        	"loose": true
	        }
	    ]
	]
};

let builds = [
    {
		input: 'src/Ddls.js',
		plugins: [
			header()
		],
		output: [
			{
				format: 'esm',
				file: 'build/ddls.module.js'
			}
		]
	},
	{
		input: 'src/Ddls.js',
		plugins: [
			babel( {
				babelHelpers: 'bundled',
				compact: false,
				babelrc: false,
				...babelrc
			} ),
			babelCleanup(),
			header()
		],
		output: [
			{
				format: 'umd',
				name: 'DDLS',
				file: 'build/ddls.js',
				indent: '\t'
			}
		]
	},
	{
		input: 'src/Ddls.js',
		plugins: [
			babel( {
				babelHelpers: 'bundled',
				babelrc: false,
				...babelrc
			} ),
			babelCleanup(),
			terser(),
			header()
		],
		output: [
			{
				format: 'umd',
				name: 'DDLS',
				file: 'build/ddls.min.js'
			}
		]
	}
	
];

if ( process.env.ONLY_MODULE === 'true' ) {

	builds = builds[ 0 ];

}

export default builds;