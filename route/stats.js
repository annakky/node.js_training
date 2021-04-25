const database = require('../config/database')

async function searchPatientsStatics(req, res) {
  const whole_query = "SELECT COUNT(*) FROM person;";
  const gender_query = "SELECT gender_concept_id, COUNT(*) FROM person GROUP BY gender_concept_id ORDER BY gender_concept_id;";
  const race_query = "SELECT race_concept_id, COUNT(*) FROM person GROUP BY race_concept_id ORDER BY race_concept_id;";
  const ethnic_query = "SELECT ethnicity_concept_id, COUNT(*) FROM person GROUP BY ethnicity_concept_id ORDER BY ethnicity_concept_id;";
  const death_query = "SELECT COUNT(*) FROM death;";

  try {
    let db_data = (await database.query(whole_query + gender_query + race_query + ethnic_query + death_query));

    let res_data = {
      'whole': db_data[0].rows[0],
      'gender': db_data[1].rows,
      'race': db_data[2].rows,
      'ethnic': db_data[3].rows,
      'death': db_data[4].rows[0]
    };
  
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send(res_data);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    let message = {
      'message': 'database error'
    }
    res.send(message);
  }
};

async function searchVisitsStatics(req, res) {
  const view_query = "CREATE OR REPLACE VIEW visit_person\
  AS (SELECT visit_occurrence_id, visit_concept_id, gender_concept_id, race_concept_id, ethnicity_concept_id, birth_datetime\
  FROM visit_occurrence LEFT JOIN person USING(person_id));";
  const delete_view_query = "DROP VIEW visit_person;";
  const type_query = "SELECT visit_concept_id, COUNT(*) FROM visit_occurrence GROUP BY visit_concept_id ORDER BY visit_concept_id;";
  const gender_query = "SELECT gender_concept_id, COUNT(*) FROM visit_person GROUP BY gender_concept_id ORDER BY gender_concept_id;"
  const race_query = "SELECT race_concept_id, COUNT(*) FROM visit_person GROUP BY race_concept_id ORDER BY race_concept_id;"
  const ethnic_query = "SELECT ethnicity_concept_id, COUNT(*) FROM person GROUP BY ethnicity_concept_id ORDER BY ethnicity_concept_id;";
  const age_query = "SELECT FLOOR(EXTRACT(YEAR FROM age(birth_datetime::date)) / 10) * 10 as age, COUNT(*) FROM visit_person GROUP BY age ORDER BY age;";

  try {
    let create_view = (await database.query(view_query));
    let db_data = (await database.query(type_query + gender_query + race_query + ethnic_query + age_query));
    let delete_view = (await database.query(delete_view_query));
    console.log(db_data[0]);
    let res_data = {
      'type': db_data[0].rows,
      'gender': db_data[1].rows,
      'race': db_data[2].rows,
      'ethnic': db_data[3].rows,
      'age': db_data[4].rows
    };
  
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send(res_data);
  } catch (err) {
    console.log(err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    let message = {
      'message': 'database error'
    }
    res.send(message);
  }
};

module.exports = {'patients': searchPatientsStatics, 'visits': searchVisitsStatics}