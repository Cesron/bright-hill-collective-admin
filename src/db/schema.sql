CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	email VARCHAR(255) NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	hashed_password TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL
);
-- Índice para el email (útil para búsquedas rápidas o validación de duplicados)
CREATE INDEX idx_users_email ON users (email ASC NULLS LAST);


CREATE TABLE user_logins (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	user_id UUID NOT NULL,
	access_jti UUID NOT NULL,
	refresh_jti UUID NOT NULL,
	expiration_date TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL,
	CONSTRAINT user_logins_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Índices
CREATE INDEX idx_user_logins_access_jti ON user_logins (access_jti ASC NULLS LAST);
CREATE INDEX idx_user_logins_refresh_jti ON user_logins (refresh_jti ASC NULLS LAST);
CREATE INDEX idx_user_logins_user_id ON user_logins (user_id ASC NULLS LAST);
