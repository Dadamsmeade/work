import React, { useContext, useEffect, useState } from 'react';
import { Flex, Select, Box } from '@chakra-ui/react';
import { PlexCustomerContext } from '../../context/plexCustomerContext';
import { ShippingContext } from '../../context/shippingContext';
import { getCarrierImageTypes, getCarrierStockTypes } from '../../api/index';

const LabelSelect = () => {
    const { plexCustomerState } = useContext(PlexCustomerContext);
    const { shippingState, dispatchShipping } = useContext(ShippingContext);
    const { selectedCarrier, selectedImageType, selectedStockType } = shippingState;
    const [imageTypes, setImageTypes] = useState([]);
    const [stockTypes, setStockTypes] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        getCarrierImageTypes(plexCustomerState, selectedCarrier?.Name, 'Image_Type')
            .then(imageTypesResponse => {
                setImageTypes(imageTypesResponse.data);
                // Find the first image type with an Image_Type_Preference and set it as selected
                const preferredImageType = imageTypesResponse.data.find(
                    imageType => imageType.Image_Type_Preference !== null,
                );
                if (preferredImageType) {
                    const preferredValue = JSON.stringify({
                        key: preferredImageType.Image_Type_Key,
                        value: preferredImageType.Type,
                    });
                    dispatchShipping({
                        type: 'SET_SELECTED_IMAGE_TYPE',
                        payload: preferredValue,
                    });
                }
            })
            .catch(err => {
                console.error(err);
                setError({ imageTypes: true }); // Set error state to true when fetching fails
            });
    }, [plexCustomerState]);

    useEffect(() => {
        if (selectedImageType && selectedCarrier?.Name) {
            getCarrierStockTypes(
                plexCustomerState,
                selectedCarrier.Name,
                selectedImageType,
                'Image_Type',
            )
                .then(stockTypesResponse => {
                    setStockTypes(stockTypesResponse?.data?.[0]);
                    // Find the default stock type if any
                    const defaultStockType =
                        stockTypesResponse?.data?.[0].Stock_Types?.find(
                            stockType => stockType?.Stock_Type_Preference,
                        );
                    dispatchShipping({
                        type: 'SET_SELECTED_STOCK_TYPE',
                        payload: defaultStockType?.Type,
                    });
                })
                .catch(err => {
                    console.error(err);
                    setError({ stockTypes: true }); // Set error state to true when fetching fails
                });
        }
    }, [selectedImageType]);

    const handleImageTypeChange = event => {
        // clear state to avoid intermittent race condition selected label types
        dispatchShipping({
            type: 'SET_SELECTED_IMAGE_TYPE',
            payload: null,
        });
        dispatchShipping({
            type: 'SET_SELECTED_STOCK_TYPE',
            payload: null,
        });
        const imageType = event.target.value;

        if (imageType) {
            dispatchShipping({
                type: 'SET_SELECTED_IMAGE_TYPE',
                payload: imageType,
            });

            getCarrierStockTypes(
                plexCustomerState,
                selectedCarrier?.Name,
                JSON.parse(imageType),
                'Image_Types',
            )
                .then(stockTypesResponse => {
                    // Find the default stock type, if any
                    const defaultStockType =
                        stockTypesResponse.data?.[0]?.Stock_Types?.find(
                            stockType => stockType?.Default,
                        );
                    dispatchShipping({
                        type: 'SET_SELECTED_STOCK_TYPE',
                        payload: defaultStockType?.Type,
                    });
                })
                .catch(err => {
                    console.error(err);
                    setError({ stockTypes: true }); // Set error state to true when fetching fails
                });
        }
    };

    const handleStockTypeChange = event => {
        const selectedStockTypeValue = event.target.value;
        dispatchShipping({
            type: 'SET_SELECTED_STOCK_TYPE',
            payload: selectedStockTypeValue,
        });
    };

    return selectedCarrier?.Name === 'fedEx' ? ( // since UPS defaults to GIF
        <Box>
            <Select
                placeholder="Select label type"
                onChange={handleImageTypeChange}
                mb={2}
                value={selectedImageType ? JSON.stringify(selectedImageType) : null}
            >
                {error?.imageTypes ? (
                    <option disabled>Something went wrong.</option>
                ) : (
                    imageTypes?.map(imageType => (
                        <option
                            key={imageType.Image_Type_Key}
                            value={JSON.stringify({
                                // this should probably be a string and not parsed JSON
                                key: imageType.Image_Type_Key,
                                value: imageType.Type,
                            })}
                        >
                            {imageType.Type}
                        </option>
                    ))
                )}
            </Select>

            {selectedImageType && (
                <>
                    <Flex align="center" mb={2}>
                        <Select
                            placeholder="Select stock type"
                            onChange={handleStockTypeChange}
                            value={selectedStockType}
                            flex="1"
                        >
                            {error?.stockTypes ? (
                                <option disabled>Something went wrong.</option>
                            ) : (
                                stockTypes?.Stock_Types?.map(stockType => (
                                    <option // this should probably be parsed JSON if we are looking to update the db using the Image_Type_Key
                                        key={stockType.Stock_Type_Key}
                                        value={stockType.Type}
                                    >
                                        {stockType.Type}
                                    </option>
                                ))
                            )}
                        </Select>
                    </Flex>
                </>
            )}
        </Box>
    ) : null;
};

export default LabelSelect;
