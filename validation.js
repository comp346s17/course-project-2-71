$(function(){
	$(#register-form).validate({
		rules: {
			username: {
				required: true,
			},
			password: {
				required: true,
				strongPassword: true
			},
			password2: {
				required: true,
				equalTo: '#password'
			},
		}
	});
})