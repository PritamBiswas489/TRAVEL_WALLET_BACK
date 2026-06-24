import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const { User, AirwallexKycAccount, AirwallexCardholder, AirwallexUserDebitCards } = db;

export default class AirWallexVirtualCardSerivice {
    static async getAirWalletxToken() {
        const apiKey = process.env.AIRWALLEX_API_KEY;
        const clientId = process.env.AIRWALLEX_CLIENT_ID;
        const apiUrl = process.env.AIRWALLEX_API_URL;
        const accountId = process.env.AIRWALLEX_ACCOUNT_ID;

        console.log("Requesting Airwallex access token with clientId:", clientId);
        console.log("Using API Key:", apiKey);


        const res = await axios.post(
            `${apiUrl}/api/v1/authentication/login`,
            {},
            {
                headers: {
                    "x-client-id": clientId,
                    "x-api-key": apiKey,
                    "x-login-as": accountId,
                },
            },
        );

        return res?.data?.token || null;
    }
    static async airwallexCreateIndividualCardholder({ userId, payload }, callback) {
        try {
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            console.log('getAirwallexKycAccount', getAirwallexKycAccount);
            if (getAirwallexKycAccount.status === 'ACTIVE') {
                const chhecking = await AirwallexCardholder.findOne({ where: { userId } });
                if (chhecking) {
                    return callback(new Error("CARDHOLDER_ALREADY_EXISTS"), null);
                }
                console.log("========================================================");
                const userKycinputData = getAirwallexKycAccount.userInputData;
                const body = {
                    type: 'INDIVIDUAL',
                    email: userKycinputData.email,
                    mobile_number: userKycinputData.mobile,
                    individual: {
                        date_of_birth: new Date(userKycinputData.dateOfBirth).toISOString().split('T')[0],
                        name: {
                            first_name: userKycinputData.firstName,
                            last_name: userKycinputData.lastName,
                        },
                        address: {
                            line1: userKycinputData.address,
                            city: userKycinputData.suburb,
                            state: userKycinputData.state,
                            country: userKycinputData.country,
                            postcode: userKycinputData.postCode,
                        },
                        // Required: confirms the individual's consent for identity verification
                        express_consent_obtained: 'yes',
                    },
                };
                const accessToken = await this.getAirWalletxToken();

                if (!accessToken) {
                    return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
                }
                const apiUrl = process.env.AIRWALLEX_API_URL;
                const response = await fetch(`${apiUrl}/api/v1/issuing/cardholders/create`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        "x-on-behalf-of": getAirwallexKycAccount.airwallexAccountId,
                    },
                    body: JSON.stringify(body),
                });
                try {
                    const updatePayload = body;
                    const curlCmd = [
                        'curl -X POST "' + apiUrl + '/api/v1/issuing/cardholders/create" \\',
                        '  -H "Content-Type: application/json" \\',
                        '  -H "Authorization: Bearer ' + accessToken + '" \\',
                        '  -H "x-on-behalf-of: ' + getAirwallexKycAccount.airwallexAccountId + '" \\',
                        "  -d '" + JSON.stringify(updatePayload) + "'",
                    ].join("\n");
                    const curlFilePath = path.resolve("airwallex-cardholder-create-curl.txt");
                    fs.writeFileSync(
                        curlFilePath,
                        '# Generated: ' + new Date().toISOString() + '\n\n' + curlCmd + '\n',
                    );
                } catch (_) {
                    /* non-blocking */
                }
                if (!response.ok) {
                    const errorResponse = await response.json();
                    return callback(new Error(`Cardholder creation failed: ${errorResponse.message}`), null);
                }
                const cardholder = await response.json();
                if (cardholder.cardholder_id) {
                    const insertedCardholder = await AirwallexCardholder.create({
                        userId: userId,
                        cardholderId: cardholder.cardholder_id,
                        status: cardholder.status,
                        type: cardholder.type,
                        email: cardholder.email,
                        mobileNumber: cardholder.mobile_number,
                        individualFirstName: cardholder.individual?.name?.first_name,
                        individualLastName: cardholder.individual?.name?.last_name,
                        individualNameOnCard: cardholder.individual?.name?.name_on_card,
                        individualDateOfBirth: cardholder.individual?.date_of_birth,
                        individualAddressLine1: cardholder.individual?.address?.line1,
                        individualAddressCity: cardholder.individual?.address?.city,
                        individualAddressState: cardholder.individual?.address?.state,
                        individualAddressCountry: cardholder.individual?.address?.country,
                        individualAddressPostcode: cardholder.individual?.address?.postcode,
                    });
                    if (!insertedCardholder) {
                        return callback(new Error("CARDHOLDER_CREATION_FAILED"), null);
                    }
                    return callback(null, insertedCardholder);
                } else {
                    return callback(new Error("CARDHOLDER_CREATION_FAILED"), null);
                }

            }
            return callback(new Error("USER_KYC_NOT_ACTIVE"), null);

        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            callback(error, null);
        }
    }
    static async airwallexGetAllCardholders({ userId }, callback) {
        try {
            const accessToken = await this.getAirWalletxToken();
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }
            const apiUrl = process.env.AIRWALLEX_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/issuing/cardholders?email=john.doe@example.com&page_num=0&page_size=100`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    "x-on-behalf-of": getAirwallexKycAccount.airwallexAccountId,
                },
            });

            try {
                const cardholdersUrl = `${apiUrl}/api/v1/issuing/cardholders?email=john.doe@example.com&page_num=0&page_size=100`;
                const curlCmd = [
                    'curl -X GET "' + cardholdersUrl + '" \\',
                    '  -H "Content-Type: application/json" \\',
                    '  -H "Authorization: Bearer ' + accessToken + '"',
                    '  -H "x-on-behalf-of: ' + getAirwallexKycAccount.airwallexAccountId + '"',
                ].join("\n");
                const curlFilePath = path.resolve("airwallex-cardholders-list-curl.txt");
                fs.writeFileSync(
                    curlFilePath,
                    '# Generated: ' + new Date().toISOString() + '\n\n' + curlCmd + '\n',
                );
            } catch (_) {
                /* non-blocking */
            }
            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`Get cardholders failed: ${errorResponse.message}`), null);
            }
            const cardholdersData = await response.json();
            console.log('Cardholders fetched:', cardholdersData);
            return callback(null, cardholdersData);

        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }
    static async airwallexDeleteCardholder({ userId, payload }, callback) {
        try {
            const accessToken = await this.getAirWalletxToken();
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }
            const apiUrl = process.env.AIRWALLEX_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/issuing/cardholders/${payload.cardHolderId}/delete`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    "x-on-behalf-of": getAirwallexKycAccount.airwallexAccountId,
                },
            });
            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`Delete cardholder failed: ${errorResponse.message}`), null);
            }
            const deleteResult = await response.json();
            console.log('Cardholder deleted:', deleteResult);
            return callback(null, deleteResult);
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }

    }
    static async airwallexCreateVirtualCard({ userId, payload }, callback) {
        try {
            const getCardholder = await AirwallexCardholder.findOne({ where: { userId } });
            if (!getCardholder) {
                return callback(new Error("CARDHOLDER_NOT_FOUND"), null);
            }
            if (getCardholder.status !== 'READY') {
                return callback(new Error("CARDHOLDER_NOT_READY"), null);
            }
            const accessToken = await this.getAirWalletxToken();
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }
            const randomUUID = uuidv4();
            const body = {
                program: {
                    purpose: 'CONSUMER',   // Indicates a consumer card
                    type: 'DEBIT',        // PREPAID | DEBIT | CREDIT | DEFERRED_DEBIT
                },
                is_personalized: true,   // Required for consumer cards
                form_factor: 'VIRTUAL',  // VIRTUAL card — suitable for digital wallet provisioning
                cardholder_id: getCardholder.cardholderId,
                authorization_controls: {
                    allowed_merchant_categories: [],
                    allowed_transaction_count: 'MULTIPLE', // SINGLE or MULTIPLE
                    transaction_limits: {
                        currency: 'ILS',
                        limits: [
                            {
                                amount: 100000,
                                interval: 'PER_TRANSACTION',
                            },
                        ],
                    },
                },
                created_by: `${getCardholder.individualFirstName} ${getCardholder.individualLastName}`,       // Your full legal name
                request_id: randomUUID,     // Unique per request — used for idempotency
            };
            console.log("========================================================");
            console.log(getAirwallexKycAccount.airwallexAccountId);
            console.log("Creating virtual card with payload:", body);
            const apiUrl = process.env.AIRWALLEX_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/issuing/cards/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    "x-on-behalf-of": getAirwallexKycAccount.airwallexAccountId,
                },
                body: JSON.stringify(body),
            });
            try {
                const cardholdersUrl = `${apiUrl}/api/v1/issuing/cards/create`;

                const curlCmd = [
                    `curl -X POST "${cardholdersUrl}" \\`,
                    `  -H "Content-Type: application/json" \\`,
                    `  -H "Authorization: Bearer ${accessToken}" \\`,
                    `  -H "x-on-behalf-of: ${getAirwallexKycAccount.airwallexAccountId}" \\`,
                    `  -d '${JSON.stringify(body)}'`
                ].join('\n');
                const curlFilePath = path.resolve("airwallex-cardholders-card-create.txt");
                fs.writeFileSync(
                    curlFilePath,
                    '# Generated: ' + new Date().toISOString() + '\n\n' + curlCmd + '\n',
                );
            } catch (_) {
                /* non-blocking */
            }
            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`Virtual card creation failed: ${errorResponse.message}`), null);
            }
            const cardData = await response.json();
            this.saveAllCardInRecord({ userId }, (error, response) => { });
            console.log('Virtual card created:', cardData);
            return callback(null, cardData);
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }

    static async saveAllCardInRecord({ userId }, callback) {
        try {
            const getCardholder = await AirwallexCardholder.findOne({ where: { userId } });
            if (!getCardholder) {
                return callback(new Error("CARDHOLDER_NOT_FOUND"), null);
            }
            const accessToken = await this.getAirWalletxToken();
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);

            }
            const apiUrl = process.env.AIRWALLEX_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/issuing/cards?cardholder_id=${getCardholder.cardholderId}&page_num=0&page_size=100`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    "x-on-behalf-of": getAirwallexKycAccount.airwallexAccountId,
                },
            });
            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`Get cards failed: ${errorResponse.message}`), null);
            }
            const cardsData = await response.json();
            if (cardsData?.items && cardsData?.items.length > 0) {
                for (const card of cardsData.items) {
                    const existingCard = await AirwallexUserDebitCards.findOne({ where: { cardId: card.card_id } });
                    if (!existingCard) {
                        await AirwallexUserDebitCards.create({
                            userId: userId,
                            brand: card.brand,
                            cardId: card.card_id,
                            cardNumber: card.card_number,
                            cardStatus: card.card_status,
                            cardholderId: card.cardholder_id,
                            airwallexCreatedAt: new Date(card.created_at),
                            airwallexUpdatedAt: new Date(card.updated_at),
                        });
                    } else {
                        await existingCard.update({
                            brand: card.brand,
                            cardNumber: card.card_number,
                            cardStatus: card.card_status,
                            airwallexUpdatedAt: new Date(card.updated_at),
                        });
                    }
                }
            }
            return callback(null, cardsData);
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }

    static async getAllCardInRecord({ userId }, callback) {
        try {
            const cards = await AirwallexUserDebitCards.findAll({ where: { userId } });
            return callback(null, cards);
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }

    static async getSensitiveDetails({ userId, payload }, callback) {
       
        console.log('getSensitiveDetails called with userId:', userId, 'and payload:', payload);
        try {
            // Check card exists for this user
            const card = await AirwallexUserDebitCards.findOne({
                where: {  cardId: payload.cardId }
            });
            if (!card) {
                return callback(new Error("CARD_NOT_FOUND"), null);
            }

            // Get access token
            const accessToken = await this.getAirWalletxToken();
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }

            // Get connected account ID
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({
                where: { userId }
            });
            if (!getAirwallexKycAccount) {
                return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
            }

            const apiUrl = process.env.AIRWALLEX_API_URL;

            // Step 1: Create PAN token instead of directly fetching sensitive details
            const response = await fetch(`${apiUrl}/api/v1/issuing/pantokens/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-on-behalf-of': getAirwallexKycAccount.airwallexAccountId,
                },
                body: JSON.stringify({
                    card_id: payload.cardId
                })
            });
            const curlCmd = [
                `curl -X POST "${apiUrl}/api/v1/issuing/pantokens/create" \\`,
                `  -H "Content-Type: application/json" \\`,
                `  -H "Authorization: Bearer ${accessToken}" \\`,
                `  -H "x-on-behalf-of: ${getAirwallexKycAccount.airwallexAccountId}" \\`,
                `  -d '{"card_id": "${payload.cardId}"}'`
            ].join('\n');
            const curlFilePath = path.resolve("airwallex-pan-token-create.txt");
            fs.writeFileSync(
                curlFilePath,
                '# Generated: ' + new Date().toISOString() + '\n\n' + curlCmd + '\n',
            );

            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`PAN token creation failed: ${errorResponse.message}`), null);
            }



            const { token, expires_at } = await response.json();
            console.log('PAN token created successfully:', { token, expires_at });
            console.log('PAN token fetched, expires at:', expires_at);

            // Step 2: Build the secure iframe URL to return to React Native
            const hash = {
                token: token,
                langKey: 'en',
                rules: {
                    '.details': {
                        backgroundColor: '#2a2a2a',
                        color: 'white',
                        borderRadius: '20px',
                        fontFamily: 'Arial'
                    },
                    '.details__row': {
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '20px'
                    },
                    '.details__label': {
                        width: '100px',
                        fontWeight: 'bold'
                    },
                    '.details__content': { display: 'flex' },
                    '.details__button svg': { color: 'white' }
                }
            };
            const hashURI = encodeURIComponent(JSON.stringify(hash));
            const iframeURL = `https://airwallex.com/issuing/pci/v2/${payload.cardId}/details#${hashURI}`;

            return callback(null, `<iframe src="${iframeURL}" width="100%" height="400px" style="border:none;"></iframe>`);

        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }




}