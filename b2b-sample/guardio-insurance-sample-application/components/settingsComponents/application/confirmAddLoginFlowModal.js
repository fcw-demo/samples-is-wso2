/*
 * Copyright (c) 2022 WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *http://www.apache.org/licenses/LICENSE-2.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Button, Col, Grid, Loader, Modal, Row } from 'rsuite';
import stylesSettings from '../../../styles/Settings.module.css';
import decodeGetApplication from '../../../util/apiDecode/settings/application/decodeGetApplication';
import decodeListCurrentApplication from '../../../util/apiDecode/settings/application/decodeListCurrentApplication';
import decodePatchApplicationAuthSteps from '../../../util/apiDecode/settings/application/decodePatchApplicationAuthSteps';
import { checkIfJSONisEmpty } from '../../../util/util/common/common';
import { LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE } from '../../../util/util/frontendUtil/frontendUtil';
import { PatchApplicationAuthMethod } from '../../../util/util/applicationUtil/applicationUtil';

export default function ConfirmAddLoginFlowModal(props) {

    const [allApplications, setAllApplications] = useState({});
    const [loadingDisplay, setLoadingDisplay] = useState(LOADING_DISPLAY_NONE);

    const fetchData = useCallback(async () => {
        const res = await decodeListCurrentApplication(props.session);
        await setAllApplications(res);
    }, [props]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onSubmit = async () => {
        allApplications.applications[0].name
        setLoadingDisplay(LOADING_DISPLAY_BLOCK);
        decodeGetApplication(props.session, allApplications.applications[0].id)
            .then((response) => decodePatchApplicationAuthSteps(props.session, response,
                allApplications.applications[0].id, props.idpDetails, PatchApplicationAuthMethod.ADD)
                .then((response) => {
                    props.fetchAllIdPs().finally();
                    props.onModalClose();
                })
                .finally((response) => setLoadingDisplay(LOADING_DISPLAY_NONE)))

        // decodeEditUser(props.session, props.user.id, values.firstName, values.familyName, values.email,
        //     values.username)
        //     .then((response) => onDataSubmit(response, form))
        //     .finally((response) => setLoadingDisplay(LOADING_DISPLAY_NONE))
    }

    return (
        <Modal
            open={props.openModal}
            onClose={props.onModalClose}>
            <Modal.Header>
                <Modal.Title><b>Add Identity Provider to the Login Flow</b></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    checkIfJSONisEmpty(allApplications) || allApplications.totalResults == 0
                        ? <EmptySelectApplicationBody />
                        : <ApplicationListAvailable allApplications={allApplications} />
                }
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onSubmit} className={stylesSettings.addUserButton} appearance="primary">
                    Confirm
                </Button>
                <Button onClick={props.onModalClose} className={stylesSettings.addUserButton} appearance="ghost">
                    Cancel
                </Button>
            </Modal.Footer>

            <div style={loadingDisplay}>
                <Loader size="lg" backdrop content="Idp is adding to the login flow" vertical />
            </div>

        </Modal >
    )
}

function EmptySelectApplicationBody() {

    return (
        <div >
            <p>No Applications Available</p>
            <div style={{ marginLeft: "5px" }}>
                <div>Create an application from the WSO2 IS or Asgardeo console to add authentication.</div>
                <p>For more details check out the following links</p>
                <ul>
                    <li>
                        <a href='https://wso2.com/asgardeo/docs/guides/applications/' target="_blank">
                            Add application from Asgardeo console
                        </a>
                    </li>
                </ul>
            </div>


        </div>
    )
}

function ApplicationListAvailable(props) {

    return (
        <div>
            <p>This will add the Idp as an authentication step to the authentication flow of the following
                applicaiton</p>

            <ApplicationListItem application={props.allApplications.applications[0]} />

            <p>Please confirm your action to procced</p>

        </div>
    );

}


function ApplicationListItem(props) {

    return (
        <div style={{ marginTop: 15, marginBottom: 15 }}>
            <Grid fluid>
                <Row>
                    <Col>
                        <Avatar>{props.application.name[0]}</Avatar>
                    </Col>

                    <Col>
                        <div>{props.application.name}</div>
                        <p>{props.application.description}</p>
                    </Col>
                </Row>
            </Grid>
        </div>

    )
}
