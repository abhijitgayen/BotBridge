'use strict';
const unirest = require('unirest');
const signale = require('signale');
const fs = require('fs');

class WhatsappCloud {
    constructor({
        accessToken,
        graphAPIVersion,
        senderPhoneNumberId,
        WABA_ID,
    }) {
        this.accessToken = accessToken;
        this.graphAPIVersion = graphAPIVersion || 'v17.0';
        this.senderPhoneNumberId = senderPhoneNumberId;
        this.baseUrl = `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneNumberId}`;
        this.WABA_ID = WABA_ID;

        if (!this.accessToken) {
            throw new Error('Missing "accessToken"');
        }

        if (!this.senderPhoneNumberId) {
            throw new Error('Missing "senderPhoneNumberId".');
        }

        if (graphAPIVersion) {
            signale.warn(
                `Please note, the default "graphAPIVersion" is v17.0. You are using ${graphAPIVersion}. This may result in quirky behavior.`
            );
        }

        this._callWhatsappAPI = ({ baseUrl, url, method, headers, body }) => {

            return new Promise((resolve, reject) => {
                let defaultHeaders = () => {
                    let output = {
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en_US',
                        Accept: 'application/json',
                    };
                    if (this.accessToken) {
                        output['Authorization'] = `Bearer ${this.accessToken}`;
                    }
                    return output;
                };
                let defaultBody = {};
                let defaultMethod = 'GET';

                if (!url) {
                    throw new Error('"url" is required in making a request');
                }

                if (!method) {
                    signale.warn(
                        `WARNING: "method" is missing. The default method will default to ${defaultMethod}. If this is not what you want, please specify the method.`
                    );
                }

                if (method?.toUpperCase() === 'POST' && !body) {
                    signale.warn(
                        `WARNING: "body" is missing. The default body will default to ${JSON.stringify(
                            defaultBody
                        )}. If this is not what you want, please specify the body.`
                    );
                }

                method = method?.toUpperCase() || defaultMethod;
                headers = {
                    ...defaultHeaders(),
                    ...headers,
                };
                body = body || defaultBody;
                this.baseUrl = baseUrl || this.baseUrl;
                let fullUrl = `${this.baseUrl}${url}`;

                unirest(method, fullUrl)
                    .headers(headers)
                    .send(JSON.stringify(body))
                    .end(function (res) {
                        if (res.error) {
                            let errorObject = () => {
                                try {
                                    return (
                                        res.body?.error ||
                                        JSON.parse(res.raw_body)
                                    );
                                } catch (e) {
                                    return {
                                        error: res.raw_body,
                                    };
                                }
                            };
                            console.log(errorObject(),'rtyuio')
                            reject({
                                status: 'failed',
                                ...errorObject(),
                            });
                        } else {
                            resolve({
                                status: 'success',
                                data: res.body,
                            });
                        }
                    });
            });
        };

        this._mustHaverecipientPhone = (recipientPhone) => {
            if (!recipientPhone) {
                throw new Error(
                    '"recipientPhone" is required in making a request'
                );
            }
        };

        this._mustHaveMessage = (message) => {
            if (!message) {
                throw new Error('"message" is required in making a request');
            }
        };

        this._mustHaveMessageId = (messageId) => {
            if (!messageId) {
                throw new Error('"messageId" is required in making a request');
            }
        };

        this._uploadMedia = async ({ file_path, file_name }) => {
            return new Promise((resolve, reject) => {
                const mediaFile = fs.createReadStream(file_path);
                // type = type || 'image';
                unirest(
                    'POST',
                    `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneNumberId}/media`
                )
                    .headers({
                        Authorization: `Bearer ${this.accessToken}`,
                    })
                    .field('messaging_product', 'whatsapp')
                    .attach('file', mediaFile)
                    .end((res) => {
                        if (res.error) {
                            reject(res.error);
                        } else {
                            let response = JSON.parse(res.raw_body);
                            resolve({
                                status: 'success',
                                media_id: response.id,
                                file_name: file_name || null,
                            });
                        }
                    });
            });
        };

        this._retrieveMediaUrl = async ({ media_id }) => {
            const response = await this._callWhatsappAPI({
                baseUrl: `https://graph.facebook.com/${this.graphAPIVersion}`,
                url: `/${media_id}`,
                method: 'GET',
            });

            if (response.status === 'success') {
                return response.data;
            }
            throw new Error(response.error);
        };

        this.UNTESTED_downloadMediaViaUrl = async ({ media_url }) => {
            return new Promise((resolve, reject) => {
                unirest('GET', `${media_url}?access_token=${this.accessToken}`)
                    .headers({
                        Authorization: `Bearer ${this.accessToken}`,
                    })
                    .end((res) => {
                        if (res.error) {
                            reject(res.error);
                        } else {
                            let responseHeaders = res.headers;
                            resolve({
                                status: 'success',
                                // ...res,
                                ...responseHeaders,
                            });
                        }
                    });
            });
        };
    }

    async templateMessage ({template_name,language_code = 'en_US' ,recipientPhone}){
        const body = {
            "messaging_product": "whatsapp",
            "to": recipientPhone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendText({ message, recipientPhone , message_id = null}) {
        this._mustHaverecipientPhone(recipientPhone);
        this._mustHaveMessage(message);
        let body = {
            messaging_product: 'whatsapp',
            to: recipientPhone,
            type: 'text',
            text: {
                preview_url: false,
                body: message,
            },
        };

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendSimpleButtons({ recipientPhone, message, listOfButtons, message_id = null }) {
        this._mustHaveMessage(message);
        this._mustHaverecipientPhone(recipientPhone);
        
        if(!listOfButtons) throw new Error('listOfButtons cannot be empty');
        if(listOfButtons.length > 3) throw new Error('listOfButtons cannot be bigger than 3 elements');
        
        let validButtons = listOfButtons
            .map((button) => {
                if (!button.title) {
                    throw new Error('"title" is required in making a request.');
                }
                if (button.title.length > 20) {
                    throw new Error(
                        'The button title must be between 1 and 20 characters long.'
                    );
                }
                if (!button.id) {
                    throw new Error('"id" is required in making a request.');
                }
                if (button.id.length > 256) {
                    throw new Error(
                        'The button id must be between 1 and 256 characters long.'
                    );
                }

                return {
                    type: 'reply',
                    reply: {
                        title: button.title,
                        id: button.id,
                    },
                };
            })
            .filter(Boolean);

        let body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: message,
                },
                action: {
                    buttons: validButtons,
                },
            },
        };

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendRadioButtons({
        recipientPhone,
        headerText,
        bodyText,
        footerText,
        listOfSections,
    }) {
        this._mustHaverecipientPhone(recipientPhone);

        if (!bodyText)
            throw new Error('"bodyText" is required in making a request');
        if (!headerText)
            throw new Error('"headerText" is required in making a request');
        if (!footerText)
            throw new Error('"footerText" is required in making a request');

        let totalNumberOfItems = 0;
        let validSections = listOfSections
            .map((section) => {
                let title = section.title;
                let rows = section.rows?.map((row) => {
                    if (!row.id) {
                        throw new Error(
                            '"row.id" of an item is required in list of radio buttons.'
                        );
                    }
                    if (row.id.length > 200) {
                        throw new Error(
                            'The row id must be between 1 and 200 characters long.'
                        );
                    }
                    if (!row.title) {
                        throw new Error(
                            '"row.title" of an item is required in list of radio buttons.'
                        );
                    }
                    if (row.title.length > 24) {
                        throw new Error(
                            'The row title must be between 1 and 24 characters long.'
                        );
                    }
                    if (!row.description) {
                        throw new Error(
                            '"row.description" of an item is required in list of radio buttons.'
                        );
                    }
                    if (row.description.length > 72) {
                        throw new Error(
                            'The row description must be between 1 and 72 characters long.'
                        );
                    }

                    totalNumberOfItems += 1;

                    return {
                        id: row.id,
                        title: row.title,
                        description: row.description,
                    };
                });
                if (!title) {
                    throw new Error(
                        '"title" of a section is required in list of radio buttons.'
                    );
                }
                return {
                    title,
                    rows,
                };
            })
            .filter(Boolean);

        if (totalNumberOfItems > 10) {
            throw new Error(
                'The total number of items in the rows must be equal or less than 10.'
            );
        }

        let body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: headerText,
                },
                body: {
                    text: bodyText,
                },
                footer: {
                    text: footerText,
                },
                action: {
                    button: 'Select a product',
                    sections: validSections,
                },
            },
        };

        if (validSections.length === 0) {
            throw new Error('"listOfSections" is required in making a request');
        }

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendImage({ recipientPhone, caption, file_path, file_name, url , message_id = null}) {
        this._mustHaverecipientPhone(recipientPhone);
        if (file_path && url) {
            throw new Error(
                'You can only send an image in your "file_path" or an image in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        if (!file_path && !url) {
            throw new Error(
                'You must send an image in your "file_path" or an image in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        let body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'image',
            image: {
                caption: caption || '',
            },
        };

        if (file_path) {
            let uploadedFile = await this._uploadMedia({
                file_path,
                file_name,
            });
            body['image']['id'] = uploadedFile.media_id;
        } else {
            body['image']['link'] = url;
        }

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendVideo({ recipientPhone, caption, file_path, file_name, url , message_id = null}) {
        this._mustHaverecipientPhone(recipientPhone);
        if (file_path && url) {
            throw new Error(
                'You can only send an video in your "file_path" or an video in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        if (!file_path && !url) {
            throw new Error(
                'You must send an video in your "file_path" or an video in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        let body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'video',
            video: {
                caption: caption || '',
            },
        };
        if (file_path) {
            let uploadedFile = await this._uploadMedia({
                file_path,
                file_name,
            });
            body['video']['id'] = uploadedFile.media_id;
        } else {
            body['video']['link'] = url;
        }

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendAudio({ recipientPhone, caption, file_path, file_name, url, message_id = null }) {
        this._mustHaverecipientPhone(recipientPhone);
        if (file_path && url) {
            throw new Error(
                'You can only send an audio in your "file_path" or an audio in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        if (!file_path && !url) {
            throw new Error(
                'You must send an audio in your "file_path" or an audio in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        let body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'audio',
            audio: {
                // caption: caption || '',
            },
        };

        if (file_path) {
            let uploadedFile = await this._uploadMedia({
                file_path,
                file_name,
            });
            body['audio']['id'] = uploadedFile.media_id;
        } else {
            body['audio']['link'] = url;
        }

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendDocument({ recipientPhone, caption, file_path, url , message_id = null}) {
        this._mustHaverecipientPhone(recipientPhone);
        if (file_path && url) {
            throw new Error(
                'You can only send a document in your "file_path" or one that is in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        if (!file_path && !url) {
            throw new Error(
                'You must send a document in your "file_path" or one that is in a publicly available "url". Provide either "file_path" or "url".'
            );
        }

        if (!caption) {
            throw new Error('"caption" is required when sending a document');
        }

        let body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'document',
            document: {
                caption: caption || '',
            },
        };

        if (file_path) {
            let uploadedFile = await this._uploadMedia({
                file_path,
                file_name: caption,
            });
            body['document']['id'] = uploadedFile.media_id;
            body['document']['filename'] = uploadedFile.file_name || '';
        } else {
            body['document']['link'] = url;
        }

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendLocation({ recipientPhone, latitude, longitude, name, address, message_id = null }) {
        this._mustHaverecipientPhone(recipientPhone);
        if (!latitude || !longitude) {
            throw new Error(
                '"latitude" and "longitude" are required in making a request'
            );
        }

        if (!name || !address) {
            throw new Error(
                '"name" and "address" are required in making a request'
            );
        }

        let body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'location',
            location: {
                latitude,
                longitude,
                name,
                address,
            },
        };

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    async sendContact({ recipientPhone, contact_profile, message_id = null }) {
        this._mustHaverecipientPhone(recipientPhone);

        let format_address = (address) => {
            let address_obj = {
                street: address.street || null,
                city: address.city || null,
                state: address.state || null,
                zip: address.zip || null,
                country: address.country || null,
                country_code: address.country_code || null,
                type: address.type || null,
            };

            return address_obj;
        };

        let format_email = (email) => {
            if (!email || !email?.email) {
                return {};
            }

            let email_obj = {
                email: email.email || null,
                type: email.type || null,
            };

            return email_obj;
        };

        let format_name = (name) => {
            if (!name || !name?.first_name || !name?.last_name) {
                throw new Error(
                    'Provide both "name.first_name" and "name.last_name".'
                );
            }
            let name_obj = {
                formatted_name: name.formatted_name || null,
                first_name: name.first_name || null,
                last_name: name.last_name || null,
                middle_name: name.middle_name || null,
                suffix: name.suffix || null,
                prefix: name.prefix || null,
            };

            if (
                !name_obj.formatted_name &&
                name_obj.first_name &&
                name_obj.last_name
            ) {
                name_obj.formatted_name = `${name_obj.first_name} ${name_obj.last_name}`;
            }

            return name_obj;
        };

        let format_org = (org) => {
            if (!org || !org?.company) {
                return {};
            }
            let org_obj = {
                company: org.company || null,
                department: org.department || null,
                title: org.title || null,
            };

            return org_obj;
        };

        let format_phone = (phone) => {
            if (!phone || !phone?.phone) {
                return {};
            }
            let phone_obj = {
                phone: phone.phone || null,
                type: phone.type || null,
                wa_id: phone.wa_id || null,
            };

            return phone_obj;
        };

        let format_url = (url) => {
            if (!url || !url?.url) {
                return {};
            }
            let url_obj = {
                url: url.url || null,
                type: url.type || null,
            };

            return url_obj;
        };

        let format_birthday = (birthday) => {
            if (!birthday) {
                return null;
            } else {
                //ensure it is a valid date
                function isValidDate(dateObject) {
                    return new Date(dateObject).toString() !== 'Invalid Date';
                }

                if (!isValidDate(birthday)) {
                    throw new Error(
                        'Provide a valid date in format: "YYYY-MM-DD"'
                    );
                }

                return birthday;
            }
        };

        let format_contact = ({
            addresses,
            emails,
            name,
            org,
            phones,
            urls,
            birthday,
        }) => {
            let fields = {
                addresses: [],
                emails: [],
                name: {},
                org: {},
                phones: [],
                urls: [],
                birthday: '',
            };

            if (addresses && Array.isArray(addresses) && addresses.length > 0) {
                fields.addresses = addresses.map(format_address);
            }

            if (emails && Array.isArray(emails) && emails.length > 0) {
                fields.emails = emails.map(format_email);
            }

            if (name && typeof name === 'object') {
                fields.name = format_name(name);
            }

            if (org && typeof org === 'object') {
                fields.org = format_org(org);
            }

            if (phones && Array.isArray(phones) && phones.length > 0) {
                fields.phones = phones.map(format_phone);
            }

            if (urls && Array.isArray(urls) && urls.length > 0) {
                fields.urls = urls.map(format_url);
            }

            if (birthday) {
                fields.birthday = format_birthday(birthday);
            }

            return fields;
        };

        let body = {
            messaging_product: 'whatsapp',
            to: recipientPhone,
            type: 'contacts',
            contacts: [format_contact(contact_profile)],
        };

        if (message_id){
            body['context'] = {
                message_id: message_id
            }
        }

        let response = await this._callWhatsappAPI({
            url: '/messages',
            method: 'POST',
            body,
        });

        return response;
    }

    // working on 
    
    async markMessageAsRead({ message_id }) {
        try {
            this._mustHaveMessageId(message_id);
            let response = await this._callWhatsappAPI({
                url: `/messages`,
                method: 'POST',
                body: {
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id,
                },
            });

            return response;
        } catch (error) {
            let msg = error?.error_data?.details;
            if (msg && msg.includes('last-seen message in this conversation')) {
                //ignore error anyway: If message is already read or has already been deleted - since whatever the error it is non-retryable.
                return {
                    status: 'success',
                    data: { success: false, error: msg },
                };
            } else {
                return {
                    status: 'failed',
                    error,
                };
            }
        }
    }

    async sendSticker({ message, recipientPhone }) {
        
    }

    async getUserProfile({ recipientPhone }) {}

    async getUserStatus({ recipientPhone }) {}

    async getUserProfilePicture({ recipientPhone }) {}

    async getUserStatusPicture({ recipientPhone }) {}
}

module.exports = WhatsappCloud;

