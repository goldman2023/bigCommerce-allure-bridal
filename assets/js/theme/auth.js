import PageManager from './page-manager';
import stateCountry from './common/state-country';
import nod from './common/nod';
import validation from './common/form-validation';
import forms from './common/models/forms';
import swal from './global/sweet-alert';

import {
    classifyForm,
    Validators,
    createPasswordValidationErrorTextObject,
    announceInputErrorMessage,
} from './common/utils/form-utils';
import { createTranslationDictionary } from './common/utils/translations-utils';

export default class Auth extends PageManager {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
        this.formCreateSelector = 'form[data-create-account-form]';
        this.formCreateSelectorCustom = 'form[data-create-custom-account-form]';
        this.recaptcha = $('.g-recaptcha iframe[src]');
    }

    registerLoginValidation($loginForm) {
        const loginModel = forms;

        this.loginValidator = nod({
            submit: '.login-form button[type="submit"]',
            tap: announceInputErrorMessage,
        });

        this.loginValidator.add([
            {
                selector: '.login-form input[name="login_email"]',
                validate: (cb, val) => {
                    const result = loginModel.email(val);

                    cb(result);
                },
                errorMessage: this.context.useValidEmail,
            },
            {
                selector: '.login-form input[name="login_pass"]',
                validate: (cb, val) => {
                    const result = loginModel.password(val);

                    cb(result);
                },
                errorMessage: this.context.enterPass,
            },
        ]);

        $loginForm.on('submit', event => {
            this.loginValidator.performCheck();

            if (this.loginValidator.areAll('valid')) {
                localStorage.setItem('loginEvent', true);
                return;
            }

            event.preventDefault();
        });
    }

    registerForgotPasswordValidation($forgotPasswordForm) {
        this.forgotPasswordValidator = nod({
            submit: '.forgot-password-form input[type="submit"]',
            tap: announceInputErrorMessage,
        });

        this.forgotPasswordValidator.add([
            {
                selector: '.forgot-password-form input[name="email"]',
                validate: (cb, val) => {
                    const result = forms.email(val);

                    cb(result);
                },
                errorMessage: this.context.useValidEmail,
            },
        ]);

        $forgotPasswordForm.on('submit', event => {
            this.forgotPasswordValidator.performCheck();

            if (this.forgotPasswordValidator.areAll('valid')) {
                return;
            }

            event.preventDefault();
        });
    }

    registerNewPasswordValidation() {
        const { password: enterPassword, password_match: matchPassword } = this.validationDictionary;
        const newPasswordForm = '.new-password-form';
        const newPasswordValidator = nod({
            submit: $(`${newPasswordForm} input[type="submit"]`),
            tap: announceInputErrorMessage,
        });
        const passwordSelector = $(`${newPasswordForm} input[name="password"]`);
        const password2Selector = $(`${newPasswordForm} input[name="password_confirm"]`);
        const errorTextMessages = createPasswordValidationErrorTextObject(enterPassword, enterPassword, matchPassword, this.passwordRequirements.error);
        Validators.setPasswordValidation(
            newPasswordValidator,
            passwordSelector,
            password2Selector,
            this.passwordRequirements,
            errorTextMessages,
        );
    }

    regcreateAccountValidator($createAccountFormCustom) {
        const validationModel = validation($createAccountFormCustom, this.context);
        const createAccountValidator = nod({
            submit: `${this.formCreateSelectorCustom} input[type='submit']`,
            tap: announceInputErrorMessage,
        });
        const firstNameSelector = `${this.formCreateSelectorCustom} input[name='register_first']`;
        const $firstNameElement = $(firstNameSelector);
        const lastNameSelector = `${this.formCreateSelectorCustom} input[name='register_last']`;
        const $lastNameElement = $(lastNameSelector);

        const emailSelector = `${this.formCreateSelectorCustom} input[name='register_email']`;
        const $emailElement = $(emailSelector);
        const passwordSelector = `${this.formCreateSelectorCustom} input[name='register_pass']`;
        const $passwordElement = $(passwordSelector);
        const password2Selector = `${this.formCreateSelectorCustom} input[name='register_pass-confirm']`;
        const $password2Element = $(password2Selector);

        createAccountValidator.add(validationModel);
        createAccountValidator.add([
            {
                selector: firstNameSelector,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: 'First Name cannot be empty',
            },
            {
                selector: lastNameSelector,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: 'Last Name cannot be empty',
            },
        ]);
        
        if ($emailElement) {
            createAccountValidator.remove(emailSelector);
            Validators.setEmailValidation(createAccountValidator, emailSelector, this.validationDictionary.valid_email);
        }

        if ($passwordElement && $password2Element) {
            const { password: enterPassword, password_match: matchPassword } = this.validationDictionary;

            createAccountValidator.remove(passwordSelector);
            createAccountValidator.remove(password2Selector);
            Validators.setPasswordValidation(
                createAccountValidator,
                passwordSelector,
                password2Selector,
                this.passwordRequirements,
                createPasswordValidationErrorTextObject(enterPassword, enterPassword, matchPassword, this.passwordRequirements.error),
            );
        }

        let self = this;
        $createAccountFormCustom.on('submit', function(e){
            e.preventDefault();

            createAccountValidator.performCheck();

            if (createAccountValidator.areAll('valid')) {
                let validform = customValidation();
                if(validform) {
                    const formData = {
                        email: $('#login_email').val(),
                        first_name: $('#register_first').val(),
                        last_name: $('#register_last').val(),
                        phone: "",
                        authentication: {
                            force_password_reset: true,
                            new_password: $('#register_pass').val()
                        }
                    };
                    $.ajax({
                        type: "POST",
                        url: `https://apim.workato.com/allure/allure-b2c-website/login/createaccount`,
                        headers: {"API-TOKEN": self.context.workatoApiToken},
                        data: JSON.stringify(formData),
                        success: response => {
                            swal.fire({
                                text: "Your account has been created",
                                icon: 'success',
                                showCancelButton: false
                            })
                           window.location.href = '/account.php?action=account_details';
                        },
                        error: error => {
                            console.log(error.responseJSON.Error.split('".customer_create":"')[1].replace(`"}}'`, ''));
                            let jsondata = error.responseJSON.Error.split('".customer_create":"')[1].replace(`"}}'`, '');
                            swal.fire({
                                text: jsondata,
                                icon: 'error',
                                showCancelButton: false
                            })
                        }
                    });
                }
            }
        });
        function  customValidation() {
            if(!$('.register_pass-policy').is(":checked")) {
                $('.register_pass-policy').parent().parent().parent().addClass('form-field--error');
                return false;
            }
            return true;
        }
    }

    /**
     * Request is made in this function to the remote endpoint and pulls back the states for country.
     */
    onReady() {
        if (!this.recaptcha.attr('title')) {
            this.recaptcha.attr('title', this.context.recaptchaTitle);
        }

        const $createAccountForm = classifyForm(this.formCreateSelector);
        const $createAccountFormCustom = classifyForm(this.formCreateSelectorCustom);
        const $loginForm = classifyForm('.login-form');
        const $forgotPasswordForm = classifyForm('.forgot-password-form');
        const $newPasswordForm = classifyForm('.new-password-form'); // reset password

        // Injected via auth.html
        this.passwordRequirements = this.context.passwordRequirements;

        if ($loginForm.length) {
            this.registerLoginValidation($loginForm);
        }

        if ($newPasswordForm.length) {
            this.registerNewPasswordValidation();
        }

        if ($forgotPasswordForm.length) {
            this.registerForgotPasswordValidation($forgotPasswordForm);
        }

        if ($createAccountForm.length) {
            this.registerCreateAccountValidator($createAccountForm);
        }
        if ($createAccountFormCustom.length) {
            this.regcreateAccountValidator($createAccountFormCustom);
        }

    }
}
