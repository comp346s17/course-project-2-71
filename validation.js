// override jquery validate plugin defaults
//source: http://stackoverflow.com/questions/18754020/bootstrap-3-with-jquery-validation-plugin
$.validator.setDefaults({
    highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
            error.insertAfter(element);
        }
    }
});


//source: https://github.com/bookercodes/code-cast-code/blob/master/client-validation-demo/validation.js
$.validator.addMethod('strongPassword', function(value, element) {
    return this.optional(element) 
      || value.length >= 6
      && /\d/.test(value)
      && /[a-z]/i.test(value);
  }, 'Your password must be at least 6 characters long and contain at least one number and one char\'.')


$(function(){
	$('#signup-form').validate({
		console.log('call validate on singup form')
		rules: {
			username: {
				minlength: 3
			},
			password: {
				strongPassword: true
			},
			password2: {
				equalTo: '#password'
			},
		}
	});

})