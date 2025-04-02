const { mapMagentoToPlexAddressRequest } = require('../mapMagentoToPlexAddressRequest');

describe('mapMagentoToPlexAddressRequest tests', () => {
    let magentoOrder;
    let customerCode;
    let buildingCode;

    beforeEach(() => {
        magentoOrder = {
            billing_address: {
                entity_id: 1001,
                firstname: 'Test',
                lastname: 'Billing',
                street: ['654 Test St', 'Ste 200'],
                city: 'Minneapolis',
                region: 'MN',
                country_id: 'US',
                postcode: '55413',
                telephone: '123-456-7890',
                email: 'Test.Billing@example.com'
            },
            extension_attributes: {
                shipping_assignments: [
                    {
                        shipping: {
                            address: {
                                entity_id: 1002,
                                firstname: 'Test',
                                lastname: 'Shipping',
                                street: ['321 Test Ave', 'Ste 100'],
                                city: 'St Paul',
                                region: 'MN',
                                country_id: 'US',
                                postcode: '55113',
                                telephone: '987-654-3210',
                                email: 'Test.Shipping@example.com'
                            }
                        }
                    }
                ]
            }
        };

        customerCode = 'TEST.CODE';
        buildingCode = 'TEST.BUILDING';
    });

    it('should map billing address correctly (isBillTo = true)', () => {
        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result).toEqual({
            Active: true,
            Address: '654 Test St',
            Bill_To: 1,
            City: 'Minneapolis',
            Country: 'US',
            County: '',
            Customer_Address_Code: 'Test Billing 1001 - Bill To',
            Customer_Address_Name: 'Test Billing - Bill To',
            Customer_Code: customerCode,
            Default_Ship_From: buildingCode,
            Email: 'Test.Billing@example.com',
            Phone: '123-456-7890',
            Ship_To: 0,
            State: 'MN',
            Zip: '55413'
        });
    });

    it('should map shipping address correctly (isBillTo = false)', () => {
        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, false);

        expect(result).toEqual({
            Active: true,
            Address: '321 Test Ave',
            Bill_To: 0,
            City: 'St Paul',
            Country: 'US',
            County: '',
            Customer_Address_Code: 'Test Shipping 1002 - Ship To',
            Customer_Address_Name: 'Test Shipping - Ship To',
            Customer_Code: customerCode,
            Default_Ship_From: buildingCode,
            Email: 'Test.Shipping@example.com',
            Phone: '987-654-3210',
            Ship_To: 1,
            State: 'MN',
            Zip: '55113'
        });
    });

    it('should handle missing telephone', () => {
        delete magentoOrder.billing_address.telephone;

        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Phone).toBe('');
    });

    it('should handle null telephone', () => {
        magentoOrder.billing_address.telephone = null;

        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Phone).toBe('');
    });

    it('should use first street line for Address field', () => {
        magentoOrder.billing_address.street = [
            '654 Test St',
            'Ste 200',
            'Floor 3'
        ];

        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Address).toBe('654 Test St');
    });

    it('should handle empty street array', () => {
        magentoOrder.billing_address.street = [];

        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Address).toBeUndefined();
    });

    it('should format Customer_Address_Code and Customer_Address_Name correctly', () => {
        magentoOrder.billing_address.firstname = 'Robert';
        magentoOrder.billing_address.lastname = 'Smith';

        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Customer_Address_Code).toBe('Robert Smith 1001 - Bill To');
        expect(result.Customer_Address_Name).toBe('Robert Smith - Bill To');
    });

    it('should set Bill_To and Ship_To flags correctly for billing address', () => {
        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Bill_To).toBe(1);
        expect(result.Ship_To).toBe(0);
    });

    it('should set Bill_To and Ship_To flags correctly for shipping address', () => {
        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, false);

        expect(result.Bill_To).toBe(0);
        expect(result.Ship_To).toBe(1);
    });

    it('should include Customer_Code and Default_Ship_From in the output', () => {
        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Customer_Code).toBe(customerCode);
        expect(result.Default_Ship_From).toBe(buildingCode);
    });

    it('should handle different country values', () => {
        magentoOrder.billing_address.country_id = 'MN';

        const result = mapMagentoToPlexAddressRequest(magentoOrder, customerCode, buildingCode, true);

        expect(result.Country).toBe('MN');
    });
});