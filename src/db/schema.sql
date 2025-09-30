-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ENUMs para validación de tipos
CREATE TYPE payment_status AS ENUM ('Pagado', 'No Pagado', 'N/A');
CREATE TYPE volunteer_status AS ENUM ('Completado', 'No Completado', 'N/A');
CREATE TYPE month_enum AS ENUM ('enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre');

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

-- Trigger para actualizar updated_at en users
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Trigger para actualizar updated_at en user_logins
CREATE TRIGGER trigger_user_logins_updated_at
    BEFORE UPDATE ON user_logins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===== NUEVAS TABLAS =====

CREATE TABLE institutions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	name TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL
);
-- Índice para el nombre de la institución
CREATE INDEX idx_institutions_name ON institutions (name ASC NULLS LAST);

-- Trigger para actualizar updated_at en institutions
CREATE TRIGGER trigger_institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE grades (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	name TEXT NOT NULL UNIQUE,
	academic_level TEXT NOT NULL, -- inicial, media, bachiller, universitario
	institution_id UUID NOT NULL,
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL,
	CONSTRAINT grades_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES institutions(id)
);
-- Índices
CREATE INDEX idx_grades_name ON grades (name ASC NULLS LAST);
CREATE INDEX idx_grades_academic_level ON grades (academic_level ASC NULLS LAST);
CREATE INDEX idx_grades_institution_id ON grades (institution_id ASC NULLS LAST);

-- Trigger para actualizar updated_at en grades
CREATE TRIGGER trigger_grades_updated_at
    BEFORE UPDATE ON grades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE students (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	name TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL
);
-- Índice para el nombre del estudiante
CREATE INDEX idx_students_name ON students (name ASC NULLS LAST);

-- Trigger para actualizar updated_at en students
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE payment_obligations_types (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	name TEXT NOT NULL
);
-- Índice para el nombre del tipo de obligación de pago
CREATE INDEX idx_payment_obligations_types_name ON payment_obligations_types (name ASC NULLS LAST);

CREATE TABLE students_grades (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	student_id UUID NOT NULL,
	grade_id UUID NOT NULL,
	academic_year INT NOT NULL,
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL,
	CONSTRAINT students_grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id),
	CONSTRAINT students_grades_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES grades(id),
	-- Constraint único para evitar duplicados de estudiante-grado-año
	CONSTRAINT unique_student_grade_year UNIQUE (student_id, grade_id, academic_year)
);
-- Índices
CREATE INDEX idx_students_grades_student_id ON students_grades (student_id ASC NULLS LAST);
CREATE INDEX idx_students_grades_grade_id ON students_grades (grade_id ASC NULLS LAST);
CREATE INDEX idx_students_grades_academic_year ON students_grades (academic_year ASC NULLS LAST);

-- Trigger para actualizar updated_at en students_grades
CREATE TRIGGER trigger_students_grades_updated_at
    BEFORE UPDATE ON students_grades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE payment_obligations (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	student_grade_id UUID NOT NULL,
	payment_obligation_type_id UUID NOT NULL,
	status payment_status NOT NULL DEFAULT 'No Pagado',
	due_date DATE,
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL,
	CONSTRAINT payment_obligations_student_grade_id_fkey FOREIGN KEY (student_grade_id) REFERENCES students_grades(id),
	CONSTRAINT payment_obligations_type_id_fkey FOREIGN KEY (payment_obligation_type_id) REFERENCES payment_obligations_types(id)
);
-- Índices
CREATE INDEX idx_payment_obligations_student_grade_id ON payment_obligations (student_grade_id ASC NULLS LAST);
CREATE INDEX idx_payment_obligations_type_id ON payment_obligations (payment_obligation_type_id ASC NULLS LAST);
CREATE INDEX idx_payment_obligations_status ON payment_obligations (status ASC NULLS LAST);
CREATE INDEX idx_payment_obligations_due_date ON payment_obligations (due_date ASC NULLS LAST);

-- Trigger para actualizar updated_at en payment_obligations
CREATE TRIGGER trigger_payment_obligations_updated_at
    BEFORE UPDATE ON payment_obligations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE volunteer_obligations (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	student_grade_id UUID NOT NULL,
	month month_enum NOT NULL,
	status volunteer_status NOT NULL DEFAULT 'No Completado',
	created_at TIMESTAMP DEFAULT now() NOT NULL,
	updated_at TIMESTAMP DEFAULT now() NOT NULL,
	CONSTRAINT volunteer_obligations_student_grade_id_fkey FOREIGN KEY (student_grade_id) REFERENCES students_grades(id),
	-- Constraint único para evitar duplicados de estudiante-grado-mes
	CONSTRAINT unique_student_grade_month UNIQUE (student_grade_id, month)
);
-- Índices
CREATE INDEX idx_volunteer_obligations_student_grade_id ON volunteer_obligations (student_grade_id ASC NULLS LAST);
CREATE INDEX idx_volunteer_obligations_month ON volunteer_obligations (month ASC NULLS LAST);
CREATE INDEX idx_volunteer_obligations_status ON volunteer_obligations (status ASC NULLS LAST);

-- Trigger para actualizar updated_at en volunteer_obligations
CREATE TRIGGER trigger_volunteer_obligations_updated_at
    BEFORE UPDATE ON volunteer_obligations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
