import React from 'react'
import { Title2, Text } from '@fluentui/react-components'
import '../styles/pages/NoAccess.css'

export default function NoAccess() {
    return (
        <div>
            <Title2>Access denied</Title2>
            <br />
            <br />
            <Text className="noAccess">You do not have access to this resource.</Text>
        </div>
    )
}
