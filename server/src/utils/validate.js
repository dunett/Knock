// validate email
// If email is valid, return true 
function validateEmail(email) {
  const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  return emailRegexp.test(email);
}

function validateGender(gender) {
  if (gender == 1 || gender == 2) {
    return true;
  }

  return false;
}

function validateAgeMinMax(age_min, age_max) {
  if (age_max >= age_min) {
    return true;
  }

  return false;
}

// TODO: validate user alias

module.exports = {
  validateEmail,
  validateGender,
  validateAgeMinMax,
};