import React from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const DashboardTile = ({ title, pathname }) => {
    const router = useRouter();
    // Dynamic colors for hover effects
    const cardHoverBg = useColorModeValue('blue.700', 'blue.500');
    const cardHoverBorderColor = useColorModeValue('blue.400', 'blue.200');
    const textHoverColor = useColorModeValue('orange.300', 'orange.200');

    return (
        <Link href={pathname}>
            <Box
                w="250px"
                h="250px"
                bg="blue.600"
                p={0}
                color="white"
                boxShadow="0 4px 8px rgba(255, 255, 255, 0.3)"
                rounded="lg"
                overflow="hidden"
                border="2px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s ease-in-out"
                _hover={{
                    bg: cardHoverBg,
                    borderColor: cardHoverBorderColor,
                    borderWidth: '3px',
                }}
                mb={4}
            >
                <Flex direction="column" align="center" justify="center" p={5}>
                    <Text
                        fontWeight={router.pathname === pathname ? 'bold' : 'normal'}
                        textAlign="center"
                        _hover={{
                            color: textHoverColor,
                            fontWeight: 'bold',
                        }}
                        fontSize={'xl'}
                    >
                        {title}
                    </Text>
                </Flex>
            </Box>
        </Link>
    );
};

export default DashboardTile;
