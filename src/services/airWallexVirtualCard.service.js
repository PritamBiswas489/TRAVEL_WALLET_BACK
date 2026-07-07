import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const { User, AirwallexKycAccount, AirwallexCardholder, AirwallexUserDebitCards, AirwallexCardTransactions, AirwallexTransactionDispute } = db;

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
        console.log('airwallexCreateIndividualCardholder called with userId:', userId, 'and payload:', payload);
        try {
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            //console.log('getAirwallexKycAccount', getAirwallexKycAccount);
            if (getAirwallexKycAccount.status === 'ACTIVE') {
                const chhecking = await AirwallexCardholder.findOne({ where: { userId } });
                if (chhecking) {
                    return callback(new Error("CARDHOLDER_ALREADY_EXISTS"), null);
                }
                console.log("========================================================");
                const userKycinputData = getAirwallexKycAccount.userInputData;
                console.log("Creating individual cardholder for userId:", userId, "with KYC input data:", userKycinputData);
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
                console.log("Creating individual cardholder with payload:", body);
                
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
            const response = await fetch(`${apiUrl}/api/v1/issuing/cardholders?page_num=0&page_size=100`, {
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
            AirwallexCardholder.destroy({ where: { cardholderId: payload.cardHolderId } });
            return callback(null, deleteResult);
            
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }

    }
    static async airwallexCreateVirtualCard({ userId, payload }, callback) {
        console.log('airwallexCreateVirtualCard called with userId:', userId, 'and payload:', payload);
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
        console.log('saveAllCardInRecord called with userId:', userId);
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
            console.log('Cards fetched:', cardsData);
            const cardIds = [];
            if (cardsData?.items && cardsData?.items.length > 0) {
                for (const card of cardsData.items) {
                    cardIds.push(card.card_id);
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
            // Delete cards that are no longer present in the Airwallex response
            if(cardIds.length > 0){
                await AirwallexUserDebitCards.destroy({
                    where: {
                        userId: userId,
                        cardId: {
                            [db.Sequelize.Op.notIn]: cardIds,
                        },
                    },
                });
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
                where: { cardId: payload.cardId }
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

            // Step 1: Create PAN token
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
            

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error('PAN token creation failed:', errorResponse);
                return callback(new Error(`PAN token creation failed: ${errorResponse.message}`), null);
            }

            const { token, expires_at } = await response.json();
            console.log('PAN token created successfully:', { token, expires_at });


            // Step 2: Build hash with ONLY allowlisted CSS properties
            const hash = {
                token: token,
                langKey: 'en',
                rules: {
                    '.details': {
                        backgroundColor: '#2a2a2a',
                        color: 'white',
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
            const iframeURL = `${process.env.AIRWALLEX_DOMAIN}/issuing/pci/v2/${payload.cardId}/details#${hashURI}`;
            return callback(null, { iframeURL, expires_at });
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }

    }
    //update card status
    static async updateCardStatus({ userId, payload }, callback) {
        console.log('updateCardStatus called with userId:', userId, 'and payload:', payload);
        try{
            const cardId = payload.cardId;
            const newStatus = payload?.status;
            if(!cardId){
                return callback(new Error("CARD_ID_NOT_PROVIDED"), null);
            }
            if(!newStatus || !['ACTIVE', 'INACTIVE', 'CLOSED'].includes(newStatus)){
                return callback(new Error("INVALID_CARD_STATUS"), null);
            }
            const card = await AirwallexUserDebitCards.findOne({ where: { cardId, userId } });
            if (!card) {
                return callback(new Error("CARD_NOT_FOUND"), null);
            }
            const accessToken = await this.getAirWalletxToken();
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!getAirwallexKycAccount) {
                return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
            }
            const apiUrl = process.env.AIRWALLEX_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/issuing/cards/${cardId}/update`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-on-behalf-of': getAirwallexKycAccount.airwallexAccountId,
                },
                body: JSON.stringify({ card_status: newStatus })
            });
            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`Update card status failed: ${errorResponse.message}`), null);
            }
            const updatedCardData = await response.json();
            if(updatedCardData?.card_status){
                console.log("Updated card status from Airwallex: ", updatedCardData.card_status);
                if(updatedCardData.card_status === 'CLOSED'){
                    await AirwallexUserDebitCards.destroy({ where: { cardId, userId } });
                    console.log("Card deleted from record as it is canceled");
                }else{
                    console.log("Card updated Status ", updatedCardData.card_status);
                    card.cardStatus = updatedCardData.card_status;
                    await card.save();
                }
            }
            console.log('Card status updated successfully:', updatedCardData);
            return callback(null, updatedCardData);
        }catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }
    //get card limit
     
    static async getCardLimit({ userId, payload }, callback) {
        console.log('getCardLimit called with userId:', userId, 'and payload:', payload);
        try {
            const cardId = payload?.cardId || payload?.card_id;
            if (!cardId) {
                return callback(new Error("CARD_ID_NOT_PROVIDED"), null);
            }

            const card = await AirwallexUserDebitCards.findOne({ where: { cardId, userId } });
            if (!card) {
                return callback(new Error("CARD_NOT_FOUND"), null);
            }

            const accessToken = await this.getAirWalletxToken();
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }

            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!getAirwallexKycAccount) {
                return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
            }

            const apiUrl = process.env.AIRWALLEX_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/issuing/cards/${cardId}/limits`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-on-behalf-of': getAirwallexKycAccount.airwallexAccountId,
                },
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`Get card limit failed: ${errorResponse.message}`), null);
            }

            const limitData = await response.json();
            return callback(null, limitData);
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }
    static async updateCardLimit({ userId, payload }, callback) {
       try{
        const {cardId, PER_TRANSACTION, DAILY, WEEKLY, MONTHLY, ALL_TIME} = payload;
        if(!cardId){
            return callback(new Error("CARD_ID_NOT_PROVIDED"), null);
        }
        const card = await AirwallexUserDebitCards.findOne({ where: { cardId, userId } });
        if (!card) {
            return callback(new Error("CARD_NOT_FOUND"), null);
        }
        const accessToken = await this.getAirWalletxToken();
        if (!accessToken) {
            return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
        }
        const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
        if (!getAirwallexKycAccount) {
            return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
        }
        const apiUrl = process.env.AIRWALLEX_API_URL;
        const response = await fetch(`${apiUrl}/api/v1/issuing/cards/${cardId}/update`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'x-on-behalf-of': getAirwallexKycAccount.airwallexAccountId,
            },
            body: JSON.stringify({
                authorization_controls: {
                    transaction_limits: {
                        currency: 'USD',
                        limits: [
                            ...(PER_TRANSACTION ? [{ amount: PER_TRANSACTION, interval: 'PER_TRANSACTION' }] : []),
                            ...(DAILY ? [{ amount: DAILY, interval: 'DAILY' }] : []),
                            ...(WEEKLY ? [{ amount: WEEKLY, interval: 'WEEKLY' }] : []),
                            ...(MONTHLY ? [{ amount: MONTHLY, interval: 'MONTHLY' }] : []),
                            ...((ALL_TIME ) ? [{ amount: ALL_TIME , interval: 'ALL_TIME' }] : []),
                        ],
                    },
                },
            }),
        });
        if (!response.ok) {
            const errorResponse = await response.json();
            return callback(new Error(`Update card limit failed: ${errorResponse.message}`), null);
        }
        const updatedLimitData = await response.json();
        console.log('Card limit updated successfully:', updatedLimitData);
        return callback(null, updatedLimitData);
       }catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        } 
    }
    static async testingCreateTransactionForTheProvidedCard({ userId, payload }, callback) {
        console.log('testingCreateTransactionForTheProvidedCard called with userId:', userId, 'and payload:', payload);
        try {
            const { card_number, transaction_amount, transaction_currency, merchant_category_code, merchant_info } = payload;

            if (!card_number || transaction_amount === undefined || !transaction_currency || !merchant_category_code || !merchant_info) {
                return callback(new Error('MISSING_REQUIRED_FIELDS'), null);
            }

            const token = await this.getAirWalletxToken();
            if (!token) {
                return callback(new Error('AIRWALLEX_ACCESS_TOKEN_NOT_FOUND'), null);
            }
            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!getAirwallexKycAccount) {
                return callback(new Error('AIRWALLEX_KYC_ACCOUNT_NOT_FOUND'), null);
            }


            const apiBaseUrl = process.env.AIRWALLEX_API_URL || 'https://api-demo.airwallex.com';
            const response = await axios.post(
                `${apiBaseUrl}/api/v1/simulation/issuing/create`,
                {
                    card_number,
                    transaction_amount,
                    transaction_currency,
                    merchant_category_code,
                    merchant_info,
                    single_phase: true,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        'x-on-behalf-of': getAirwallexKycAccount.airwallexAccountId,
                    },
                },
            );
            console.log('Simulation transaction created successfully:', response.data);

            return callback(null, response?.data || null);
        } catch (error) {
            process.env.SENTRY_ENABLED === 'true' && Sentry.captureException(error);
            const errorMessage = error?.response?.data?.message || error?.message || 'SIMULATION_TRANSACTION_FAILED';
            return callback(new Error(errorMessage), null);
        }
    }

    static async getCardTransactionList({ userId, payload }, callback) {
        try{
            const {page_num = 0, page_size = 10 } = payload;
            const aurwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if(!aurwallexKycAccount){
                return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
            }
            const accessToken = await this.getAirWalletxToken();
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }
            const apiUrl = process.env.AIRWALLEX_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/issuing/transactions?page_num=${page_num}&page_size=${page_size}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-on-behalf-of': aurwallexKycAccount.airwallexAccountId,
                },
            });
            if (!response.ok) {
                const errorResponse = await response.json();
                return callback(new Error(`Get card transaction list failed: ${errorResponse.message}`), null);
            }
            const transactionListData = await response.json();
            return callback(null, transactionListData);

        }catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }

    static async getUserCardTransactionList({ userId, payload }, callback) {
        try{
            console.log('getUserCardTransactionList called with userId:', userId, 'and payload:', payload);
            const {limit = 20 , page = 1} = payload;
            if(!payload?.card_ids || !Array.isArray(payload.card_ids) || payload.card_ids.length === 0){
               const userCards = await AirwallexUserDebitCards.findAll({ where: { userId } });
               if(!userCards || userCards.length === 0){
                return callback(new Error("USER_HAS_NO_CARDS"), null);
               }
               payload.card_ids = userCards.map(card => card.cardId);
            }

            if(!payload?.card_ids || !Array.isArray(payload.card_ids) || payload.card_ids.length === 0) {
                return callback(new Error("CARD_IDS_NOT_PROVIDED"), null);
            }
            const getCardtransactions = await AirwallexCardTransactions.findAndCountAll({
                where: {
                    cardId: {
                        [db.Sequelize.Op.in]: payload.card_ids
                    }
                },
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: (page - 1) * limit
            });
            return callback(null, {
                total: getCardtransactions.count,
                page: page,
                limit: limit,
                transactions: getCardtransactions.rows
            });
        }catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }

    static async uploadDisputeEvidenceFile({ accessToken, file, notes = '', onBehalfOf }) {
        const filesApiUrl = process.env.AIRWALLEX_FILES_API_URL || 'https://files-demo.airwallex.com';
        const uploadUrl = `${filesApiUrl}/api/v1/files/upload${notes ? `?notes=${encodeURIComponent(notes)}` : ''}`;
        const originalname = file?.originalname || 'evidence-file';
        if (originalname.length > 50) {
            throw new Error('EVIDENCE_FILE_NAME_TOO_LONG');
        }
        const formData = new FormData();
        const fileBlob = new Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' });
        formData.append('file', fileBlob, originalname);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...(onBehalfOf ? { 'x-on-behalf-of': onBehalfOf } : {}),
            },
            body: formData,
        });

        const uploadResult = await response.json();
        if (!response.ok) {
            throw new Error(uploadResult?.message || 'EVIDENCE_FILE_UPLOAD_FAILED');
        }

        const fileId = uploadResult?.file_id;
        if (!fileId) {
            throw new Error('EVIDENCE_FILE_ID_NOT_FOUND');
        }

        return fileId;
    }

    // Dispute a transaction
    static async transactionDispute({ userId, payload }, callback) {
        console.log('transactionDispute called with userId:', userId, 'and payload:', payload);
        try{
            const { transaction_id, evidence_files, notes, reason , reference } = payload;
            if(!transaction_id){
                return callback(new Error("TRANSACTION_ID_NOT_PROVIDED"), null);
            }
            if(!reason){
                return callback(new Error("DISPUTE_REASON_NOT_PROVIDED"), null);
            }

            const checkTransaction = await AirwallexCardTransactions.findOne({ where: { transactionId: transaction_id } });
            if(!checkTransaction){
                return callback(new Error("TRANSACTION_NOT_FOUND"), null);
            }

            const userCard = await AirwallexUserDebitCards.findOne({ where: { cardId: checkTransaction.cardId, userId } });
            if(!userCard){
                return callback(new Error("TRANSACTION_NOT_BELONG_TO_USER"), null);
            }

            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!getAirwallexKycAccount) {
                return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
            }

            const accessToken = await this.getAirWalletxToken();
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }

            let evidenceFileIds = [];
            if (Array.isArray(evidence_files) && evidence_files.length > 0) {
                for (const file of evidence_files) {
                    if (!file?.buffer) {
                        continue;
                    }
                    const fileId = await this.uploadDisputeEvidenceFile({
                        accessToken,
                        file,
                        notes,
                        onBehalfOf: getAirwallexKycAccount.airwallexAccountId,
                    });
                    evidenceFileIds.push(fileId);
                }
            }
           
            console.log('Disputing transaction with ID:', transaction_id);

            const apiUrl = process.env.AIRWALLEX_API_URL;
            const referenceId = uuidv4();
            const disputeResponse = await fetch(`${apiUrl}/api/v1/issuing/transaction_disputes/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-on-behalf-of': getAirwallexKycAccount.airwallexAccountId,
                },
                
                body: JSON.stringify({
                    transaction_id,
                    reason,
                    notes: notes ?? '',
                    reference: referenceId,
                    evidence_file_ids: evidenceFileIds,
                }),
            });

            const disputeResult = await disputeResponse.json();
            if (!disputeResponse.ok) {
                return callback(new Error(disputeResult?.message || 'TRANSACTION_DISPUTE_FAILED'), null);
            }
            if(disputeResult?.id){
                const createRecord = await AirwallexTransactionDispute.create({
                    userId,
                    disputeId: disputeResult.id,
                    transactionId: disputeResult.transaction_id,
                    amount: disputeResult.amount,
                    notes: disputeResult.notes,
                    reason: disputeResult.reason,
                    reference: disputeResult.reference,
                    status: disputeResult.status,
                    updatedBy: disputeResult.updated_by,
                    created_at: disputeResult.created_at ? new Date(disputeResult.created_at) : undefined,
                    updated_at: disputeResult.updated_at ? new Date(disputeResult.updated_at) : undefined,
                });
                return callback(null, createRecord);
            }else{
                return callback(new Error('TRANSACTION_DISPUTE_FAILED'))
            }
        }catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }   
    }

    static async transactionDisputeUpdate({ userId, payload }, callback) {
        try {
            const { dispute_id, evidence_files, notes, reason, reference } = payload;
            if (!dispute_id) {
                return callback(new Error("DISPUTE_ID_NOT_PROVIDED"), null);
            }

            const existingDispute = await AirwallexTransactionDispute.findOne({
                where: { disputeId: dispute_id, userId },
            });
            if (!existingDispute) {
                return callback(new Error("DISPUTE_NOT_FOUND"), null);
            }

            const checkTransaction = await AirwallexCardTransactions.findOne({
                where: { transactionId: existingDispute.transactionId },
            });
            if (!checkTransaction) {
                return callback(new Error("TRANSACTION_NOT_FOUND"), null);
            }

            const userCard = await AirwallexUserDebitCards.findOne({
                where: { cardId: checkTransaction.cardId, userId },
            });
            if (!userCard) {
                return callback(new Error("TRANSACTION_NOT_BELONG_TO_USER"), null);
            }

            const getAirwallexKycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
            if (!getAirwallexKycAccount) {
                return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
            }

            const accessToken = await this.getAirWalletxToken();
            if (!accessToken) {
                return callback(new Error("AIRWALLEX_ACCESS_TOKEN_NOT_FOUND"), null);
            }

            let evidenceFileIds = [];
            if (Array.isArray(evidence_files) && evidence_files.length > 0) {
                for (const file of evidence_files) {
                    if (!file?.buffer) {
                        continue;
                    }
                    const fileId = await this.uploadDisputeEvidenceFile({
                        accessToken,
                        file,
                        notes,
                        onBehalfOf: getAirwallexKycAccount.airwallexAccountId,
                    });
                    evidenceFileIds.push(fileId);
                }
            }

            const apiUrl = process.env.AIRWALLEX_API_URL;
            const updatePayload = {
                notes: notes ?? '',
                reason,
                reference,
                evidence_file_ids: evidenceFileIds,
                request_id: uuidv4(),
            };

            const disputeResponse = await fetch(
                `${apiUrl}/api/v1/issuing/transaction_disputes/${dispute_id}/update`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'x-on-behalf-of': getAirwallexKycAccount.airwallexAccountId,
                    },
                    body: JSON.stringify(updatePayload),
                }
            );

            let disputeResult = {};
            try {
                disputeResult = await disputeResponse.json();
            } catch (_err) {
                disputeResult = {};
            }

            if (!disputeResponse.ok) {
                return callback(new Error(disputeResult?.message || 'TRANSACTION_DISPUTE_UPDATE_FAILED'), null);
            }

            const updatedRecord = await existingDispute.update({
                transactionId: disputeResult.transaction_id || existingDispute.transactionId,
                amount: disputeResult.amount ?? existingDispute.amount,
                notes: disputeResult.notes ?? (notes ?? existingDispute.notes),
                reason: disputeResult.reason ?? (reason ?? existingDispute.reason),
                reference: disputeResult.reference ?? (reference || existingDispute.reference),
                status: disputeResult.status ?? existingDispute.status,
                updatedBy: disputeResult.updated_by ?? existingDispute.updatedBy,
                updated_at: disputeResult.updated_at ? new Date(disputeResult.updated_at) : new Date(),
            });

            return callback(null, updatedRecord);
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }

    static async getTransactionDisputeList({ userId, payload }, callback) {
        try {
            const page = Math.max(parseInt(payload?.page, 10) || 1, 1);
            const limit = Math.max(parseInt(payload?.limit, 10) || 20, 1);
            const where = { userId };

            if (payload?.transaction_id) {
                where.transactionId = payload.transaction_id;
            }

            const disputes = await AirwallexTransactionDispute.findAndCountAll({
                where,
                order: [["id", "DESC"]],
                limit,
                offset: (page - 1) * limit,
            });

            return callback(null, {
                total: disputes.count,
                page,
                limit,
                total_pages: Math.ceil(disputes.count / limit),
                disputes: disputes.rows,
            });
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            return callback(error, null);
        }
    }

    static async handleTransactionDisputeWebhook(payload, headers, callback) {
        console.log("📥 Received transaction dispute webhook payload:", payload);
        try {
            const accountId = payload?.account_id;
            const dispute = payload?.data?.dispute;

            if (!accountId || !dispute?.id || !dispute?.transaction_id) {
                console.warn("handleTransactionDisputeWebhook: Missing required fields in payload:", payload);
                return callback(null, { data: payload });
            }

            const kycAccount = await AirwallexKycAccount.findOne({
                where: { airwallexAccountId: accountId },
            });

            if (!kycAccount) {
                console.warn("handleTransactionDisputeWebhook: no AirwallexKycAccount found for accountId:", accountId);
                return callback(null, { data: payload });
            }

            const reference = dispute.reference || null;
            const disputeData = {
                userId: kycAccount.userId,
                disputeId: dispute.id,
                transactionId: dispute.transaction_id,
                amount: dispute.amount,
                notes: dispute.notes,
                reason: dispute.reason,
                reference,
                status: dispute.status || payload?.data?.status,
                updatedBy: dispute.updated_by || payload?.data?.updated_by,
                created_at: dispute.created_at ? new Date(dispute.created_at) : undefined,
                updated_at: dispute.updated_at ? new Date(dispute.updated_at) : undefined,
            };

            

            const existingDispute = await AirwallexTransactionDispute.findOne({
                where: reference ? { reference } : { disputeId: dispute.id },
            });

             disputeData.webhookData = [dispute, ...(existingDispute?.webhookData || [])];

            if (existingDispute) {
               
                await existingDispute.update(disputeData);
                return callback(null, { data: existingDispute });
            }

             
            const createdDispute = await AirwallexTransactionDispute.create(disputeData);
            return callback(null, { data: createdDispute });
        } catch (error) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
            console.error("handleTransactionDisputeWebhook: Error processing webhook:", error);
            return callback(error, null);
        }
    }
}
