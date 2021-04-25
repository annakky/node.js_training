const database = require('../config/database')

async function searchAllColumns(req, res) {

  const table_name = req.params.table_name;
  const page = (req.query.page || 1), per_page = (req.query.per_page || 0);
  const pagination = (per_page != 0? "LIMIT " + per_page + " OFFSET " + (page - 1) * per_page: "");
  let query = "", with_query = "";

  if (table_name == 'person') {
    with_query = "\
    WITH gender_concept AS\
    (SELECT p.person_id, p.gender_concept_id, coalesce(null, c.concept_name, 'No matching concept') as gender_concept_name\
      FROM person p LEFT JOIN concept c\
      ON p.gender_concept_id = c.concept_id\
      ORDER BY p.person_id " + pagination + "),\
    \
    race_concept AS\
    (SELECT p.person_id, p.race_concept_id, coalesce(null, c.concept_name, 'No matching concept') as race_concept_name\
      FROM person p LEFT JOIN concept c\
      ON p.race_concept_id = c.concept_id\
      ORDER BY p.person_id " + pagination + "),\
    \
    ethnicity_concept AS\
    (SELECT p.person_id, p.ethnicity_concept_id, coalesce(null, c.concept_name, 'No matching concept') as ethnicity_concept_name\
      FROM person p LEFT JOIN concept c\
      ON p.ethnicity_concept_id = c.concept_id\
      ORDER BY p.person_id " + pagination + ")"

    query = "SELECT *\
    FROM person p, gender_concept g, race_concept r, ethnicity_concept e\
    WHERE p.person_id = g.person_id AND g.person_id = r.person_id AND r.person_id = e.person_id\
    ORDER BY p.person_id;";

  } else if (table_name == 'visit_occurrence') {
    with_query = "\
    WITH visit_concept AS\
    (SELECT v.visit_occurrence_id, v.visit_concept_id, coalesce(null, c.concept_name, 'No matching concept') as visit_concept_name\
      FROM visit_occurrence v LEFT JOIN concept c\
      ON v.visit_concept_id = c.concept_id\
      ORDER BY v.visit_occurrence_id " + pagination + ")"

    query = "SELECT *\
    FROM visit_occurrence v, visit_concept c\
    WHERE v.visit_occurrence_id = c.visit_occurrence_id\
    ORDER BY v.visit_occurrence_id;";
  } else if (table_name == 'condition_occurrence') {
    with_query = "\
    WITH condition_concept AS\
    (SELECT co.condition_occurrence_id, co.condition_concept_id, coalesce(null, c.concept_name, 'No matching concept') as condition_concept_name\
      FROM condition_occurrence co LEFT JOIN concept c\
      ON co.condition_concept_id = c.concept_id\
      ORDER BY co.condition_occurrence_id " + pagination + ")"

    query = "SELECT *\
    FROM condition_occurrence co, condition_concept c\
    WHERE co.condition_occurrence_id = c.condition_occurrence_id\
    ORDER BY co.visit_occurrence_id;";
  } else if (table_name == 'drug_exposure') {
    with_query = "\
    WITH drug_concept AS\
    (SELECT d.drug_exposure_id, d.drug_concept_id, coalesce(null, c.concept_name, 'No matching concept') as drug_concept_name\
      FROM drug_exposure d LEFT JOIN concept c\
      ON d.drug_concept_id = c.concept_id\
      ORDER BY d.drug_exposure_id " + pagination + ")"

    query = "SELECT *\
    FROM drug_exposure d, drug_concept c\
    WHERE d.drug_exposure_id = c.drug_exposure_id\
    ORDER BY d.drug_exposure_id;";
  } else if (table_name == 'concept') {
    query = "\
    SELECT *\
    FROM concept\
    ORDER BY concept_id " + pagination
  } else if (table_name == 'death') {
    with_query = "\
    WITH death_concept AS\
    (SELECT d.person_id, d.death_type_concept_id, coalesce(null, c.concept_name, 'No matching concept') as death_type_concept_name\
      FROM death d LEFT JOIN concept c ON d.death_type_concept_id = c.concept_id\
      ORDER BY d.person_id " + pagination + ")"

    query = "SELECT *\
    FROM death d, death_concept c\
    WHERE d.person_id = c.person_id\
    ORDER BY d.person_id;"
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    let message = {
      'message': 'check table name'
    }
    res.send(message);
  }

  try {
    let db_data = (await database.query(with_query + query));
    let link_header = `</api/tables/${table_name}?page=${page - 1}&per_page=${per_page}; rel="prev", ` + 
    `</api/tables/${table_name}?page=${page + 1}&per_page=${per_page}; rel="next", ` + 
    `</api/tables/${table_name}?page=1&per_page=${per_page}; rel="first"`
  
    res.setHeader('Accept-Ranges', 'pages');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Link', link_header);
    res.status(200);
    res.send(db_data.rows)
  } catch(err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    let message = {
      'message': 'database error'
    }
    res.send(message);
  }
}

async function searchColumn(req, res) {

  const table_name = req.params.table_name;
  const column_name = req.params.column;
  const word = (req.query.word || ''), page = (req.query.page || 1), per_page = (req.query.per_page || 0);
  const pagination = (per_page != 0? "LIMIT " + per_page + " OFFSET " + (page - 1) * per_page: "");
  const search = (word == ''? ' ': `WHERE ${column_name}::text LIKE '%${word}%' `);
  let query = "", with_query = "";
  
  const tables = ['person', 'visit_occurrence', 'condition_occurrence', 'drug_exposure', 'concept', 'death']
  const columns = [
    ['person_id', 'gender_concept_id', 'birth_datetime', 'race_concept_id', 'ethnicity_concept_id'],
    ['visit_occurrence_id', 'person_id', 'visit_concept_id', 'visit_start_datetime', 'visit_end_datetime'],
    ['person_id', 'condition_concept_id', 'condition_start_datetime', 'condition_end_datetime', 'visit_occurrence_id'],
    ['person_id', 'drug_concept_id', 'drug_exposure_start_datetime', 'drug_exposure_end_datetime', 'visit_occurrence_id'], 
    ['concept_id', 'concept_name', 'domain_id'],
    ['person_id', 'death_date']
  ]

  if (tables.indexOf(table_name) >= 0) {
    const table_index = tables.indexOf(table_name)
    if (columns[table_index].indexOf(column_name) >= 0) {
      const column_index = columns[table_index].indexOf(column_name)

      query = `SELECT *\
      FROM ${table_name} `
      + search +
      `ORDER BY ${column_name} ` + pagination

      try{
        let db_data = (await database.query(query));
        let link_header = `</api/tables/${table_name}?page=${page - 1}&per_page=${per_page}; rel="prev", ` + 
        `</api/tables/${table_name}?page=${page + 1}&per_page=${per_page}; rel="next", ` + 
        `</api/tables/${table_name}?page=1&per_page=${per_page}; rel="first"`
    
        res.setHeader('Accept-Ranges', 'pages');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Link', link_header);
        res.status(200);
        res.send(db_data.rows)
      } catch(err) {
        console.log(err)
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        let message = {
          'message': 'database error'
        }
        res.send(message);
      }
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(400);
      let message = {
        'message': `There is no ${column_name} column`
      }
      res.send(message);
    }
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    let message = {
      'message': `There is no ${table_name} table`
    }
    res.send(message);
  }

};

module.exports = {'all': searchAllColumns, 'column': searchColumn}