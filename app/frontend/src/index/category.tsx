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
import {BookOutlined} from "@ant-design/icons";



type FromScriptCategory = {
    name:string
};

export function IndexableObjectTitle(props: {
    index :entity.Index
}): React.ReactElement {

    return (<div>
        <BookOutlined style={{marginRight:"5px"}} />
        {props.index.name}
    </div>)
}
export function IndexableObjectScriptCategory(props: IndexableObjectAddModalProp): React.ReactElement {

    const [form] = Form.useForm();

    return (
        <Modal
            key={props.key}
            title="添加分类"
            open={props.show}
            onOk={async ()=>{
                let values = await form.validateFields();
                if (values) {
                    const idx = new entity.Index({
                        id: nanoid(),
                        type: "script-category",
                        name: values.name,
                    });
                    props.onAdd(idx)
                    form.resetFields()
                }
            }}
            onCancel={()=>{
                props.onCancel()
                form.resetFields()
            }}
        >
            <Form
                form={form}
                name="script-category"
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
            </Form>
        </Modal>
    )
}
