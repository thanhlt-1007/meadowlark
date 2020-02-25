$(document).ready(function() {
  $('.js-form-newsletter').on('submit', function(event) {
    event.preventDefault();

    var action = $(this).attr('action');
    var container = $(this).closest('.js-form-container-newsletter');

    $.ajax({
      url: action,
      type: 'POST',
      dataType: 'JSON',
      success: function(data) {
        if (data.success) {
          container.html('<h2>Thank you !</h2>');
        } else {
          container.html('<h2>Register is failed.</h2>');
        }
      },
      error: function() {
        container.html('<h2>There was a problem.</h2>');
      }
    });
  });
});
