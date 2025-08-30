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

import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {DeleteOutlined, FileAddOutlined, FolderAddOutlined, WalletOutlined} from "@ant-design/icons";
import {useIndexStore} from "../store/indexStore";
import {Button, ConfigProvider, Form, Input, Modal, Popconfirm, Tree, TreeDataNode} from "antd";
import {entity} from "../../wailsjs/go/models";
import './index.css'
import {nanoid} from "nanoid";
import {GetIndex, ListScript, SaveIndex} from "../../wailsjs/go/api/Api";
import {IndexableObjectScriptCategory, IndexableObjectTitle} from "./category";
import Index = entity.Index;
import {IndexableObjectScript, IndexableObjectScriptTitle} from "./script";
import {useScriptStore} from "../store/scriptStore";


const IndexWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
`
const IndexWrapperHeader = styled.div`
    height: 30px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 5px;
    border-bottom: solid 1px black;
    display: flex;
    align-items: center;
    justify-content: space-between;
`
const IndexWrapperBody = styled.div`
    position: absolute;
    top: 30px;
    left: 0;
    right: 0;
    bottom: 0;
    
`
const IndexWrapperFooter = styled.div`
    height: 0;
    left: 0;
    right: 0;
    bottom: 0;
`


export function IndexComp():React.ReactElement {
    const setup = useRef(false)

    const openedCollections = useIndexStore(state => state.openedCollections);
    const loadCollectionGroup = useIndexStore(state => state.loadCollectionGroup);
    const saveCollection = useIndexStore(state => state.saveCollection);

    const activeScript = useScriptStore(state => state.active);

    const [showAddModal, setShowAddModal] = useState(false)
    const [form] = Form.useForm();

    useEffect(() => {
        if (setup.current){
            return
        }
        loadCollectionGroup();
        setup.current = true;
    }, []);

    return (
        <IndexWrapper>
            <IndexWrapperHeader>
                <p>
                    <WalletOutlined style={{marginRight:"5px"}} />
                    脚本簿
                </p>
                <div>
                    <Button
                        icon={<FolderAddOutlined />}
                        size={'small'}
                        type={'text'}
                        onClick={async ()=>{
                            setShowAddModal(true)
                        }}
                    />
                </div>
            </IndexWrapperHeader>
            <IndexWrapperBody>
                {openedCollections.length==0?(<div style={{textAlign:"center"}}>空</div>):
                    openedCollections.map((collection, index) => (
                        <IndexCollection
                            key={collection.id}
                            collection={collection}
                            indexableObjects={{
                                "script-category": {
                                    code: "script-category",
                                    addModelNode: IndexableObjectScriptCategory,
                                    indexTitleNode: IndexableObjectTitle
                                },
                                "script":{
                                    code: "script",
                                    addModelNode: IndexableObjectScript,
                                    indexTitleNode: IndexableObjectScriptTitle,
                                    leafNode:true,
                                    onClick:  async (index) => {
                                        if (index.id==null){
                                            return
                                        }
                                        const scripts = await ListScript(Array.of(index.id));
                                        const script = scripts[0];
                                        activeScript(script)
                                    }
                                }
                            }}
                        />
                    ))
                }
            </IndexWrapperBody>
            <IndexWrapperFooter>
            </IndexWrapperFooter>
            <Modal
                title="添加脚本簿"
                open={showAddModal}
                onOk={async ()=>{
                    let values = await form.validateFields();
                    if (values) {
                        await saveCollection({
                            name: values.name
                        });
                        loadCollectionGroup()
                        form.resetFields()
                        setShowAddModal(false)
                    }
                }}
                onCancel={()=>{
                    setShowAddModal(false)
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
        </IndexWrapper>
  );
}


type FromScriptCategory = {
    name:string
};


const IndexCollectionWrapper = styled.div`
    margin-top: 5px;
    padding: 0 5px;
`
const IndexCollectionHeader = styled.div`
    background-color: #9e9e9e;
    padding: 0 8px 0 5px;
    color: #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
`
const IndexCollectionBody = styled.div`
    
`
const IndexTreeItemWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`



type IndexTree = TreeDataNode & {
    name : string
    type : string
    children?: IndexTree[]
    title: React.ReactElement
}

export function IndexCollection(props:{
    collection: entity.IndexCollection,
    indexableObjects: Record<string,IndexableObject>
}) :React.ReactElement {

    const [rawIndex,setRawIndex] = useState<entity.Index[]>([])

    const [index,setIndex] = useState<IndexTree[]>([]);

    const [addModel,setAddModel] = useState("")

    const [parentIndex,setParentIndex] = useState<IndexTree|null>(null)

    useEffect(() => {
        loadRawIndex()
    }, []);

    useEffect(() => {
            function walk(indexes:entity.Index[],its: IndexTree[],cb: (i:entity.Index)=>IndexTree|null) {
                indexes.forEach(i=>{
                    const it = cb(i);
                    if (it==null){
                        return
                    }
                    its.push(it)
                    if (i.children!=null){
                        it.children = []
                        walk(i.children,it.children,cb)
                    }
                })
            }
            const tree:IndexTree[] = []
            walk(rawIndex,tree,i => {
                if (!i.type||i.id==null) {
                    return null
                }
                const indexableObject = props.indexableObjects[i.type];
                if (!indexableObject){
                    return null
                }
                return {
                    type: i.type,
                    key: i.id,
                    title: indexableObject.indexTitleNode({index:i}),
                    name: i.name?i.name:"",

                }
            })
            setIndex(tree)
    }, [rawIndex]);

    const deleteIndex = (deleteIt:IndexTree)=>{
        if (props.collection.id==null||index==null){
            return
        }

        let pl:IndexTree[] = []
        function walk(indexes:IndexTree[],its: Index[],cb: (i:IndexTree)=>Index) {
            indexes.forEach(i=>{
                if (i.key==deleteIt.key){
                    pl = indexes
                    return;
                }
                const it = cb(i);
                if (it==null){
                    return
                }
                its.push(it)
                if (i.children!=null){
                    it.children = []
                    walk(i.children,it.children,cb)
                }
            })
        }
        const tree:Index[] = []
        walk(index,tree,i=> {
            return new entity.Index({
                id: i.key,
                name: i.name,
                type: i.type,
            })
        })
        console.log(tree)

        SaveIndex(props.collection.id,tree).then(()=>{
            console.log("保存成功")
            loadRawIndex()
        })

    }

    const loadRawIndex = () => {
        if (props.collection.id==null||index==null){
            return
        }
        GetIndex(props.collection.id).then(indexes=>{
            if (indexes==null){
                setIndex([])
                return
            }
            setRawIndex(indexes)
        })
    }

    const addIndex = (i:Index) => {
        if (i==null||i.type==null||i.id==null||props.collection.id==null){
            return
        }

        let is = index
        if (parentIndex != null) {
            if (parentIndex.children==null){
                parentIndex.children = []
            }
            is = parentIndex.children
        }
        const indexableObject = props.indexableObjects[i.type];
        if (!indexableObject){
            return null
        }

        is.push({
            type: i.type,
            key: i.id,
            title: indexableObject.indexTitleNode({index:i}),
            name: i.name?i.name:"",
        })
        setAddModel("")
        setIndex([...index])
        console.log(index)

        function walk(indexes:IndexTree[],its: Index[],cb: (i:IndexTree)=>Index) {
            indexes.forEach(i=>{
                const it = cb(i);
                if (it==null){
                    return
                }
                its.push(it)
                if (i.children!=null){
                    it.children = []
                    walk(i.children,it.children,cb)
                }
            })
        }
        const tree:Index[] = []
        walk(index,tree,i=> {
            return new entity.Index({
                id: i.key,
                name: i.name,
                type: i.type,
            })
        })
        console.log(tree)

        SaveIndex(props.collection.id,tree).then(()=>{
            console.log("保存成功")
        })
    }

    return (
        <IndexCollectionWrapper>
            <IndexCollectionHeader>
                <div>{props.collection.name}</div>
                <div>
                    <Button
                        icon={<FolderAddOutlined />}
                        size={'small'}
                        type={'text'}
                        onClick={()=>{
                            setParentIndex(null)
                            setAddModel("script-category")
                        }}
                    />
                </div>
            </IndexCollectionHeader>
            <IndexCollectionBody>
                <Tree
                    treeData={index}
                    showLine={true}
                    blockNode={true}
                    onClick={(_,index)=>{
                        const indexableObject = props.indexableObjects[index.type];
                        if (indexableObject==null){
                            return
                        }
                        if (!indexableObject.onClick) {
                            return;
                        }
                        indexableObject.onClick(new entity.Index({
                            id: index.key,
                            name: index.name,
                            type: index.type,
                        }))
                    }}
                    titleRender={(n)=>(
                        <IndexTreeItemWrapper>
                            <div>
                                {n.title}
                            </div>
                            <div>
                                {
                                    props.indexableObjects[n.type]?.leafNode?(""):(
                                        <>
                                            <Button
                                                icon={<FolderAddOutlined />}
                                                size={'small'}
                                                type={'text'}
                                                onClick={(e)=>{
                                                    setParentIndex(n)
                                                    setAddModel("script-category")
                                                    e.stopPropagation()
                                                }}
                                            />
                                            <Button
                                                icon={<FileAddOutlined />}
                                                size={'small'}
                                                type={'text'}
                                                onClick={(e)=>{
                                                    setParentIndex(n)
                                                    setAddModel("script")
                                                    e.stopPropagation()
                                                }}
                                            />
                                        </>
                                    )
                                }

                                <Popconfirm
                                    title="删除确认"
                                    onConfirm={(e)=>{
                                        if (e==null) {
                                            return
                                        }
                                        deleteIndex(n)
                                        e.stopPropagation()
                                    }}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size={'small'}
                                        type={'text'}
                                    />
                                </Popconfirm>
                            </div>
                        </IndexTreeItemWrapper>
                    )}
                />
            </IndexCollectionBody>
            {
                Object.keys(props.indexableObjects).map((key) => {
                    const indexableObject = props.indexableObjects[key]
                    return indexableObject.addModelNode({
                        key: indexableObject.code,
                        show: addModel == indexableObject.code,
                        onAdd: addIndex,
                        onCancel: () => {
                            setAddModel("")
                        }
                    })
                })
            }

        </IndexCollectionWrapper>
    )
}

type IndexableObject = {
    code :string
    addModelNode: (props: IndexableObjectAddModalProp) => React.ReactElement
    indexTitleNode: (props: {
        index:entity.Index
    }) => React.ReactElement
    onClick?: (index:entity.Index)=>void
    leafNode?: boolean
}

export type IndexableObjectAddModalProp = {
    key: string
    show: boolean
    onAdd: (cb:entity.Index) => void
    onCancel: () => void
}



