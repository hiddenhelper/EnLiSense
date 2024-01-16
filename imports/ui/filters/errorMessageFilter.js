import angular from 'angular';

const name = 'errorMessageFilter';

function ErrorMessageFilter(msg) {

  if (!msg) {
    return '';
  }

  let resultsMsg = msg;

  if (msg === "Must pass options.email") {
    resultsMsg = "Please enter an email address"
  } else if (msg === "User not found") {
    resultsMsg = "Email address not found"
  }

  return resultsMsg;
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return ErrorMessageFilter;
  });
