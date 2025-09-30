const { faker } = require("@faker-js/faker")
const postgres = require("postgres")
require("dotenv").config({ path: ".env" })

// Configuración de la base de datos usando las mismas variables de entorno
const sql = postgres({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
})

// Arrays de datos en español para hacer los datos más realistas
const gradeNames = [
  "Pre-Kinder",
  "Kinder",
  "1º Básico",
  "2º Básico",
  "3º Básico",
  "4º Básico",
  "5º Básico",
  "6º Básico",
  "7º Básico",
  "8º Básico",
  "1º Medio",
  "2º Medio",
  "3º Medio",
  "4º Medio",
  "1º Bachillerato",
  "2º Bachillerato",
  "1º Universidad",
  "2º Universidad",
  "3º Universidad",
  "4º Universidad",
]

const paymentTypes = [
  "Matrícula",
  "Pensión Mensual",
  "Material Escolar",
  "Uniforme",
  "Alimentación",
  "Transporte",
  "Seguro Estudiantil",
  "Actividades Extracurriculares",
  "Laboratorio",
  "Biblioteca",
]

const institutionNames = [
  "Colegio Bright Hill Collective",
  "Instituto San José",
  "Escuela Nueva Esperanza",
  "Colegio Santa María",
  "Instituto Técnico Industrial",
  "Universidad del Valle",
  "Colegio Bilingüe Internacional",
  "Escuela Rural El Progreso",
]

const months = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

const paymentStatuses = ["Pagado", "No Pagado", "N/A"]
const volunteerStatuses = ["Completado", "No Completado", "N/A"]

async function clearExistingData() {
  console.log("🧹 Limpiando datos existentes...")

  // Eliminar en orden correcto debido a las foreign keys
  await sql`DELETE FROM volunteer_obligations`
  await sql`DELETE FROM payment_obligations`
  await sql`DELETE FROM students_grades`
  await sql`DELETE FROM payment_obligations_types`
  await sql`DELETE FROM students`
  await sql`DELETE FROM grades`
  await sql`DELETE FROM institutions`

  console.log("✅ Datos existentes eliminados")
}

async function seedInstitutions(count = 8) {
  console.log(`🏫 Creando ${count} instituciones...`)

  const institutions = []
  for (let i = 0; i < count; i++) {
    const name =
      i < institutionNames.length
        ? institutionNames[i]
        : faker.company.name() + " Academy"

    const [institution] = await sql`
      INSERT INTO institutions (name)
      VALUES (${name})
      RETURNING id, name
    `
    institutions.push(institution)
  }

  console.log(`✅ ${institutions.length} instituciones creadas`)
  return institutions
}

async function seedGrades(institutions, gradesPerInstitution = 3) {
  console.log(`📚 Creando grados para las instituciones...`)

  const grades = []
  for (const institution of institutions) {
    for (let i = 0; i < gradesPerInstitution; i++) {
      const gradeIndex =
        (institutions.indexOf(institution) * gradesPerInstitution + i) %
        gradeNames.length
      const name = gradeNames[gradeIndex]

      // Determinar nivel académico basado en el nombre del grado
      let academicLevel
      if (name.includes("Kinder") || name.includes("Pre-")) {
        academicLevel = "inicial"
      } else if (name.includes("Básico")) {
        academicLevel = "media"
      } else if (name.includes("Medio") || name.includes("Bachillerato")) {
        academicLevel = "bachiller"
      } else {
        academicLevel = "universitario"
      }

      try {
        const [grade] = await sql`
          INSERT INTO grades (name, academic_level, institution_id)
          VALUES (${name + " - " + institution.name}, ${academicLevel}, ${institution.id})
          RETURNING id, name, academic_level, institution_id
        `
        grades.push(grade)
      } catch {
        // Si hay conflicto de nombre único, generar uno diferente
        const uniqueName = `${name} - ${institution.name} - ${faker.string.alphanumeric(4)}`
        const [grade] = await sql`
          INSERT INTO grades (name, academic_level, institution_id)
          VALUES (${uniqueName}, ${academicLevel}, ${institution.id})
          RETURNING id, name, academic_level, institution_id
        `
        grades.push(grade)
      }
    }
  }

  console.log(`✅ ${grades.length} grados creados`)
  return grades
}

async function seedStudents(count = 50) {
  console.log(`👨‍🎓 Creando ${count} estudiantes...`)

  const students = []
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const name = `${firstName} ${lastName}`

    const [student] = await sql`
      INSERT INTO students (name)
      VALUES (${name})
      RETURNING id, name
    `
    students.push(student)
  }

  console.log(`✅ ${students.length} estudiantes creados`)
  return students
}

async function seedPaymentObligationsTypes() {
  console.log(`💰 Creando tipos de obligaciones de pago...`)

  const types = []
  for (const typeName of paymentTypes) {
    const [type] = await sql`
      INSERT INTO payment_obligations_types (name)
      VALUES (${typeName})
      RETURNING id, name
    `
    types.push(type)
  }

  console.log(`✅ ${types.length} tipos de obligaciones de pago creados`)
  return types
}

async function seedStudentsGrades(students, grades, enrollmentsPerStudent = 2) {
  console.log(`📝 Creando matrículas de estudiantes...`)

  const studentsGrades = []
  const currentYear = new Date().getFullYear()

  for (const student of students) {
    // Cada estudiante puede estar matriculado en 1-3 grados diferentes (años diferentes)
    const enrollments = faker.number.int({ min: 1, max: enrollmentsPerStudent })

    for (let i = 0; i < enrollments; i++) {
      const randomGrade = faker.helpers.arrayElement(grades)
      const academicYear = currentYear - faker.number.int({ min: 0, max: 3 }) // Años 2021-2025

      try {
        const [studentGrade] = await sql`
          INSERT INTO students_grades (student_id, grade_id, academic_year)
          VALUES (${student.id}, ${randomGrade.id}, ${academicYear})
          RETURNING id, student_id, grade_id, academic_year
        `
        studentsGrades.push(studentGrade)
      } catch {
        // Si hay conflicto de unique constraint, simplemente omitir
        continue
      }
    }
  }

  console.log(`✅ ${studentsGrades.length} matrículas creadas`)
  return studentsGrades
}

async function seedPaymentObligations(
  studentsGrades,
  paymentTypes,
  obligationsPerStudent = 5,
) {
  console.log(`💳 Creando obligaciones de pago...`)

  const obligations = []

  for (const studentGrade of studentsGrades) {
    // Crear varias obligaciones por estudiante-grado
    const numObligations = faker.number.int({
      min: 2,
      max: obligationsPerStudent,
    })

    for (let i = 0; i < numObligations; i++) {
      const randomType = faker.helpers.arrayElement(paymentTypes)
      const status = faker.helpers.arrayElement(paymentStatuses)
      const dueDate = faker.date.between({
        from: new Date(2024, 0, 1),
        to: new Date(2025, 11, 31),
      })

      const [obligation] = await sql`
        INSERT INTO payment_obligations (student_grade_id, payment_obligation_type_id, status, due_date)
        VALUES (${studentGrade.id}, ${randomType.id}, ${status}, ${dueDate.toISOString().split("T")[0]})
        RETURNING id, student_grade_id, payment_obligation_type_id, status, due_date
      `
      obligations.push(obligation)
    }
  }

  console.log(`✅ ${obligations.length} obligaciones de pago creadas`)
  return obligations
}

async function seedVolunteerObligations(studentsGrades) {
  console.log(`🤝 Creando obligaciones de voluntariado...`)

  const obligations = []

  for (const studentGrade of studentsGrades) {
    // Crear obligaciones de voluntariado para algunos meses aleatorios
    const numMonths = faker.number.int({ min: 3, max: 8 })
    const selectedMonths = faker.helpers.arrayElements(months, numMonths)

    for (const month of selectedMonths) {
      const status = faker.helpers.arrayElement(volunteerStatuses)

      try {
        const [obligation] = await sql`
          INSERT INTO volunteer_obligations (student_grade_id, month, status)
          VALUES (${studentGrade.id}, ${month}, ${status})
          RETURNING id, student_grade_id, month, status
        `
        obligations.push(obligation)
      } catch {
        // Si hay conflicto de unique constraint (estudiante-mes), omitir
        continue
      }
    }
  }

  console.log(`✅ ${obligations.length} obligaciones de voluntariado creadas`)
  return obligations
}

async function generateSampleData() {
  try {
    console.log("🚀 Iniciando generación de datos de prueba...\n")

    // Limpiar datos existentes
    await clearExistingData()

    // Generar datos en orden correcto
    const institutions = await seedInstitutions(6)
    const grades = await seedGrades(institutions, 4)
    const students = await seedStudents(30)
    const paymentTypes = await seedPaymentObligationsTypes()
    const studentsGrades = await seedStudentsGrades(students, grades, 2)
    await seedPaymentObligations(studentsGrades, paymentTypes, 4)
    await seedVolunteerObligations(studentsGrades)

    console.log("\n🎉 ¡Datos de prueba generados exitosamente!")
    console.log("\n📊 Resumen de datos creados:")
    console.log(`   • ${institutions.length} instituciones`)
    console.log(`   • ${grades.length} grados`)
    console.log(`   • ${students.length} estudiantes`)
    console.log(`   • ${paymentTypes.length} tipos de obligaciones de pago`)
    console.log(`   • ${studentsGrades.length} matrículas de estudiantes`)

    // Obtener conteos finales
    const [paymentCount] =
      await sql`SELECT COUNT(*) as count FROM payment_obligations`
    const [volunteerCount] =
      await sql`SELECT COUNT(*) as count FROM volunteer_obligations`

    console.log(`   • ${paymentCount.count} obligaciones de pago`)
    console.log(`   • ${volunteerCount.count} obligaciones de voluntariado`)
  } catch (error) {
    console.error("❌ Error generando datos de prueba:", error)
    throw error
  } finally {
    await sql.end()
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  generateSampleData()
    .then(() => {
      console.log("✅ Script completado")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Error:", error)
      process.exit(1)
    })
}

module.exports = { generateSampleData }
