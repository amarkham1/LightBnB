/// Users

module.exports = (db) => {
  const getUserWithEmail = function(email) {
    const queryString = `
    SELECT *
    FROM users
    WHERE email = $1;
    `;
    const queryParams = [email];
    return db.query(queryString, queryParams)
    .then(response => {
      if (response) {
        return response.rows[0];
      } else {
        return null;
      }
    });
  };

  /**
   * Get a single user from the database given their id.
   * @param {string} id The id of the user.
   * @return {Promise<{}>} A promise to the user.
   */
  const getUserWithId = function(id) {
    const queryString = `
    SELECT *
    FROM users
    WHERE id = $1;
    `;
    const queryParams = [id];
    return db.query(queryString, queryParams)
    .then(response => res.rows[0]);
  };
  
  /**
   * Add a new user to the database.
   * @param {{name: string, password: string, email: string}} user
   * @return {Promise<{}>} A promise to the user.
   */
  const addUser =  function(user) {
    const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `;
    const queryParams = [user.name, user.email, user.password];
    return db.query(queryString, queryParams)
    .then(response => response.rows[0]);
  };

  /// Reservations

  /**
   * Get all reservations for a single user.
   * @param {string} guest_id The id of the user.
   * @return {Promise<[{}]>} A promise to the reservations.
   */
  const getAllReservations = function(guest_id, limit = 10) {
    const queryString = `
    SELECT properties.*, reservations.*, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id 
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
    `;
    const queryParams = [guest_id, limit];
    return db.query(queryString, queryParams)
    .then (response => response.rows);
  }

  /// Properties

  /**
   * Get all properties.
   * @param {{}} options An object containing query options.
   * @param {*} limit The number of results to return.
   * @return {Promise<[{}]>}  A promise to the properties.
   */
  const getAllProperties = function(options, limit = 10) {
    const queryParams = [];
    let queryString = `
    SELECT properties.*, AVG(rating) AS average_rating
    FROM properties
    LEFT JOIN property_reviews ON property_id = properties.id
    `;

    if (options.city) {
      queryParams.push(`%${options.city}%`);
      queryString += `WHERE city LIKE $${queryParams.length}`;
    }
    if (options.owner_id) {
      queryParams.push(Number(options.owner_id));
      const connector = queryParams.length > 1 ? '\n  AND' : 'WHERE';
      queryString += connector + ` owner_id = $${queryParams.length}`;
    }
    if (options.minimum_price_per_night) {
      queryParams.push(Number(options.minimum_price_per_night * 100));
      const connector = queryParams.length > 1 ? '\n  AND' : 'WHERE';
      queryString += connector + ` cost_per_night >= $${queryParams.length}`;
    }
    if (options.maximum_price_per_night) {
      queryParams.push(Number(options.maximum_price_per_night * 100));
      const connector = queryParams.length > 1 ? '\n  AND' : 'WHERE';
      queryString += connector + ` cost_per_night <= $${queryParams.length}`;
    }

    queryString += `\n  GROUP BY properties.id`;

    if (options.minimum_rating) {
      queryParams.push(Number(options.minimum_rating));
      queryString += `\n  HAVING AVG(rating) >= $${queryParams.length}`;
    }

    queryParams.push(limit);
    queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;
    return db.query(queryString, queryParams)
    .then(response => response.rows);
  };


  /**
   * Add a property to the database
   * @param {{}} property An object containing all of the property details.
   * @return {Promise<{}>} A promise to the property.
   */
  const addProperty = function(property) {
    const queryString = 
    `INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code) VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
    `;
    const queryParams = [Number(property.owner_id), property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, Number(property.parking_spaces), Number(property.number_of_bathrooms), Number(property.number_of_bedrooms), property.country, property.street, property.city, property.province, property.post_code]
    return db.query(queryString, queryParams)
    .then(response => response.rows[0]);
  }
  return { addUser, addProperty, getUserWithEmail, getUserWithId, getAllReservations, getAllProperties };
}