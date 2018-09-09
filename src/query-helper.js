module.exports = {
	decrypt: (to_decrypt, label) => {
		return `cast(AES_DECRYPT(${to_decrypt}, '${process.argv[5]}') as char(256)) ${label}`
	},
	encrypt: to_encrypt => {
		return `AES_ENCRYPT('${to_encrypt}', '${process.argv[5]}')`
	}
} 
