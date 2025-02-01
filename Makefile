gen_cert:
	mkcert -install
	mkdir -p ./.certs && cd ./.certs && mkcert localhost