/*
 *
 *  * Copyright 2025 QuiTeeom <quiteeom@gmail.com>.
 *  * Author Github: https://github.com/QuiTeeom
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     https://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import React from "react";
import {Form, Input, Modal} from "antd";
import {nanoid} from "nanoid";
import {IndexableObjectAddModalProp} from "./index";
import {entity} from "../../wailsjs/go/models";
import {SaveScript} from "../../wailsjs/go/api/Api";
import {RightCircleOutlined} from "@ant-design/icons";



type FromScriptCategory = {
    name:string
    description:string
};

export function IndexableObjectScriptTitle(props: {
    index :entity.Index
}): React.ReactElement {

    return (<div>
        <RightCircleOutlined style={{marginRight:"5px"}} />
        {props.index.name}
    </div>)
}
export function IndexableObjectScript(props: IndexableObjectAddModalProp): React.ReactElement {

    const [form] = Form.useForm();

    return (
        <Modal
            key={props.key}
            title="添加脚本"
            open={props.show}
            onOk={async ()=>{
                let values = await form.validateFields();
                if (values) {
                    let sc = new entity.Script({
                        id: nanoid(),
                        name: values.name,
                        description: values.description,
                    });

                    sc = await SaveScript(sc)
                    form.resetFields()
                    console.log('添加脚本', sc)
                    props.onAdd(new entity.Index({
                        id: sc.id,
                        type: "script",
                        name: sc.name,
                    }))
                }
            }}
            onCancel={()=>{
                props.onCancel()
                form.resetFields()
            }}
        >
            <Form
                form={form}
                name="script"
                labelCol={{ span: 3 }}
                autoComplete="off"
                layout={'horizontal'}
                style={{width:"100%"}}
            >
                <Form.Item<FromScriptCategory>
                    label="名字"
                    name="name"
                    rules={[{ required: true, message: '请输入名字' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item<FromScriptCategory>
                    label="描述"
                    name="description"
                    rules={[{ required: true, message: '请输入描述' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    )
}
