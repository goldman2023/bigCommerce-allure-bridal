import PageManager from '../page-manager';
import nod from '../common/nod';
import forms from '../common/models/forms';
import { announceInputErrorMessage } from '../common/utils/form-utils';
import swal from '../global/sweet-alert';
import { defaultModal } from '../global/modal';

export default class ManageMembers extends PageManager {
    constructor(context) {
        super(context);
        console.log(context);
        this.$manageListEl = document.querySelector('.page-content .manageMembers--members');
        this.$addMemberEl = $('.page-content .manageMembers--list li:first-child');
        this.manageMembersHtml = '';
        this.$formEl = $('#addMember--form');
        this.$overlay = $('.page-type .manageMembers--page .loadingOverlay');
        this.$modal = defaultModal();
    } 
    
    onReady() {
        if (this.context.customer) {
            this.renderAllmembers();
            this.addMemberValidations();
        } else {
            window.location.href = '/login.php';
        }  
        
        this.$addMemberEl.on('click', event => {
            $(event.currentTarget).toggleClass('open');
            $(event.currentTarget).context.nextElementSibling.classList.toggle('show');
        });
    }

    renderAllmembers() {
        const confirmDeleteMember = this.context.confirmDeleteMember;
        this.renderMembers().then(manageMemberHtml => {
            this.$manageListEl.innerHTML = manageMemberHtml;
            this.$overlay.hide();
            this.manageMembersHtml = '';
            setTimeout(() => {
                const self = this;
                const deleteElements = document.querySelectorAll('.button-delete-member');
                const editElements = document.querySelectorAll('.button-edit-member');
                if (deleteElements.length > 0) {
                    for (const element of deleteElements) {
                        element.addEventListener('click', function onClick(event) {
                            swal.fire({
                                text: confirmDeleteMember,
                                icon: 'warning',
                                showCancelButton: true
                            }).then((result) => {
                                if (result.value) {
                                    let formData = {
                                        customer_email: event.target.getAttribute('data-bc-customer-email'),
                                        customer_event: "remove"
                                    };
                                    self.deleteMember(formData);
                                }
                            });
                        });
                    }
                }
                if (editElements.length > 0) {
                    for (const ele of editElements) {
                        ele.addEventListener('click', function onClick(event) {
                            const editMemberModal = document.querySelector('.editMemberModal');
                            self.$modal.open({ size: 'large' });
                            self.$modal.updateContent(editMemberModal);
                            $('#modal .loadingOverlay').show();
                            self.editMemberValidations();
                            self.fetchCustomerDetailsByEmail(event.target.getAttribute('data-bc-customer-email')).then(response => {
                                if (response.length > 0) {
                                    let data = response[0];
                                    document.querySelector("#editMember--form input[name='first_name']").value = data.first_name;
                                    document.querySelector("#editMember--form input[name='last_name']").value = data.last_name;
                                    document.querySelector("#editMember--form input[name='email']").value = data.customer_email;
                                    document.querySelector("#editMember--form input[name='phone']").value = data.customer_phone;
                                }
                                $('#modal .loadingOverlay').hide();
                            });
                        });
                    }
                }
            }, 100);
        });
    }
    
    addMemberValidations() {
        const formSelector = 'form[data-member-add-form]';
        const memberValidator = nod({
            submit: `${formSelector} button[type="submit"]`,
            tap: announceInputErrorMessage,
        });

        const $memberForm = $(formSelector);
        memberValidator.add([
            {
                selector: `${formSelector} input[name="first_name"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberFirstName,
            },
            {
                selector: `${formSelector} input[name="last_name"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberLastName,
            },
            {
                selector: `${formSelector} input[name="email"]`,
                validate: (cb, val) => {
                    const result = forms.email(val);

                    cb(result);
                },
                errorMessage: this.context.memberEmail,
            },
            {
                selector: `${formSelector} input[name="phone"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberPhone,
            },
            {
                selector: `${formSelector} select[name="role"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberRole,
            }
        ]);

        $memberForm.on('submit', event => {
            memberValidator.performCheck();

            if (memberValidator.areAll('valid')) {
                let formData = {
                    first_name: $("#addMember--form input[name='first_name']").val(),
                    last_name: $("#addMember--form input[name='last_name']").val(),
                    customer_phone: $("#addMember--form input[name='phone']").val(),
                    customer_email: $("#addMember--form input[name='email']").val(),
                    role: $("#addMember--form select[name='role']").val(), 
                    wedding_party_id: 2,
                    customer_event: "create"
                };
                console.log(formData);
                this.addMember(formData).then(members => {
                    const alertBoxEl = document.querySelector('.alertBox');
                    const alertBoxMessgeEl = document.querySelector('.alertBox .alertBox-message #alertBox-message-text');
                    alertBoxEl.style.display = 'flex';
                    alertBoxMessgeEl.innerText = 'Member has been added successfully!';
                }).catch(error => {
                    swal.fire({
                        text: error,
                        icon: 'error',
                        showCancelButton: false
                    })
                });
            }
            event.preventDefault();
        });
    }
    
    editMemberValidations() {
        const formSelector = 'form[data-member-edit-form]';
        const memberValidator = nod({
            submit: `${formSelector} button[type="submit"]`,
            tap: announceInputErrorMessage,
        });

        const $memberForm = $(formSelector);
        memberValidator.add([
            {
                selector: `${formSelector} input[name="first_name"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberFirstName,
            },
            {
                selector: `${formSelector} input[name="last_name"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberLastName,
            },
            {
                selector: `${formSelector} input[name="email"]`,
                validate: (cb, val) => {
                    const result = forms.email(val);

                    cb(result);
                },
                errorMessage: this.context.memberEmail,
            },
            {
                selector: `${formSelector} input[name="phone"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberPhone,
            },
            {
                selector: `${formSelector} select[name="role"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val);

                    cb(result);
                },
                errorMessage: this.context.memberRole,
            }
        ]);

        $memberForm.on('submit', event => {
            memberValidator.performCheck();

            if (memberValidator.areAll('valid')) {
                let formData = {
                    first_name: $("#editMember--form input[name='first_name']").val(),
                    last_name: $("#editMember--form input[name='last_name']").val(),
                    customer_phone: $("#editMember--form input[name='phone']").val(),
                    customer_email: $("#editMember--form input[name='email']").val(),
                    role: $("#editMember--form select[name='role']").val(), 
                    wedding_party_id: 2,
                    customer_event: "update"
                };
                this.updateMember(formData).then(members => {
                    this.renderAllmembers();
                    this.$modal.close();
                    const alertBoxEl = document.querySelector('.page .alertBox');
                    const alertBoxMessgeEl = document.querySelector('.page .alertBox .alertBox-message #alertBox-message-text');
                    alertBoxEl.style.display = 'flex';
                    alertBoxMessgeEl.innerText = 'Member has been updated successfully!';
                }).catch(error => {
                    swal.fire({
                        text: error,
                        icon: 'error',
                        showCancelButton: false
                    })
                });
            }
            event.preventDefault();
        });
    }

    addMember(formData) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: `${this.context.workatoApiPath}/members/create`,
                headers: {"API-TOKEN": this.context.workatoApiToken},
                data: JSON.stringify(formData),
                success: response => {
                    resolve(response.data);
                },
                error: error => {
                    if(error.statusText) {
                        reject(error.rstatusText);
                    } else if (error.responseJSON.error) {
                        reject(error.responseJSON.error);
                    } else if (error.message) {
                        reject(error.message);
                    }else {
                        reject(error);
                    }
                }
            });
        });
    }

    updateMember(formData) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: `${this.context.workatoApiPath}/members/update`,
                headers: {"API-TOKEN": this.context.workatoApiToken},
                data: JSON.stringify(formData),
                success: response => {
                    resolve(response);
                },
                error: error => {
                    if(error.statusText) {
                        reject(error.rstatusText);
                    } else if (error.responseJSON.error) {
                        reject(error.responseJSON.error);
                    } else {
                        reject(error);
                    }
                }
            });
        });
    }

    renderMembers() {
        return new Promise((resolve, reject) => {
            this.fetchCustomerDetails().then(customers => {
                customers.forEach((customer, index) => {
                    this.manageMembersHtml += `<li id="member-${customer.customer_email}">
                        <div class="left">
                            <div class="member-name"> ${customer.first_name ? customer.first_name : ''} ${customer.last_name ? customer.last_name : ''}</div>
                            <div class="member-email"> ${customer.customer_email}</div>
                            <div class="member-phone"> ${customer.customer_phone}</div>
                            <div class="member-account-status"> ${customer.invite_status}</div>
                            <div class="member-role"> ${customer.wedding_party_role}</div>
                        </div>
                        <div class="right">
                            <button type="button" class="button button--primary button-edit-member" data-bc-customer-email="${customer.customer_email}" data-edit-member> Edit </button>
                            <button type="button" class="button button--primary button-delete-member" data-bc-customer-email="${customer.customer_email}" data-delete-member> Delete </button>
                        </div>
                    </li>`;
                });
                resolve(this.manageMembersHtml);
            }).catch(error => {
                swal.fire({
                    text: error,
                    icon: 'error',
                    showCancelButton: false
                }).then((result) => {
                    if (result.value) {
                        this.$overlay.hide();
                    }
                });
            });
        });
    }

    fetchCustomerDetails () {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: `${this.context.workatoApiPath}/members?wedding_party_id=2`,
                headers: {"API-TOKEN": this.context.workatoApiToken},
                success: response => {
                    console.log(response);
                    resolve(response.data);
                },
                error: error => {
                    if(error.statusText) {
                        reject(error.statusText);
                    } else if (error.responseJSON.error) {
                        reject(error.responseJSON.error);
                    } else {
                        reject(error);
                    }
                }
            });
        });
    }

    deleteMember (formData) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: `${this.context.workatoApiPath}/members/remove`,
                headers: {"API-TOKEN": this.context.workatoApiToken},
                data: JSON.stringify(formData),
                success: response => {
                    resolve(response.data);
                },
                error: error => {
                    if(error.statusText) {
                        reject(error.rstatusText);
                    } else if (error.responseJSON.error) {
                        reject(error.responseJSON.error);
                    } else {
                        reject(error);
                    }
                }
            });
        });
    }

    fetchCustomerDetailsByEmail (customer_email) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: `${this.context.workatoApiPath}/members?wedding_party_id=2&customer_email=${customer_email}`,
                headers: {"API-TOKEN": this.context.workatoApiToken},
                success: response => {
                    console.log(response);
                    resolve(response.data);
                },
                error: error => {
                    if(error.statusText) {
                        reject(error.statusText);
                    } else if (error.responseJSON.error) {
                        reject(error.responseJSON.error);
                    } else {
                        reject(error);
                    }
                }
            });
        });
    }
}