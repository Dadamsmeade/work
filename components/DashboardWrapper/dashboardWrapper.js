import React, { useContext } from 'react';
import { Grid, GridItem, Heading } from '@chakra-ui/react';
import Layout from '../Layout/layout';
import { AccountContext } from '../../context/accountContext';
import { FeatureContext } from '../../context/featureContext';
import DashboardTile from '../DashboardTile/dashboardTile';

const DashboardWrapper = () => {
    const { accountState } = useContext(AccountContext);
    const { featureState } = useContext(FeatureContext);
    const { features } = featureState;

    return (
        <Layout>
            <Grid templateColumns="repeat(5, 1fr)" gap={8} p={6}>
                <GridItem colSpan={1}>
                    <Heading color="blue.200" size="md" p={4} mb={4}>
                        My Apps
                    </Heading>
                    {features?.carrier && (
                        <DashboardTile title="Integrated Shipping" pathname="/shipping" />
                    )}
                    {features?.dynamicCheck && (
                        <DashboardTile title="Dynamic Check" pathname="/dynamic-check" />
                    )}
                    {accountState?.account?.userRole?.Name === 'SA' && (
                        <DashboardTile title="Developer Tools" pathname="/developer" />
                    )}
                </GridItem>
                <GridItem colSpan={3} />
            </Grid>
        </Layout>
    );
};

export default DashboardWrapper;
