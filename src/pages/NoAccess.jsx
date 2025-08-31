import React from "react";
import { Title2, Text, Button } from "@fluentui/react-components";
import {
    ShieldError24Regular,
    ArrowLeft24Regular,
    Home24Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import "../styles/pages/NoAccess.css";

export default function NoAccess() {
    const nav = useNavigate();

    return (
        <div className="container gradient">
            <div className="na-shell">
                <div className="na-card">
                    <div className="na-icon">
                        <ShieldError24Regular />
                    </div>

                    <div className="na-head">
                        <Title2 className="na-title">Access denied</Title2>
                        <Text className="na-subtitle">
                            You do not have access to this resource.
                        </Text>
                    </div>

                    <div className="na-actions">
                        <Button
                            appearance="secondary"
                            icon={<ArrowLeft24Regular />}
                            onClick={() => nav(-1)}
                        >
                            Go back
                        </Button>
                        <Button
                            appearance="primary"
                            icon={<Home24Regular />}
                            onClick={() => nav("/")}
                        >
                            Go to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
