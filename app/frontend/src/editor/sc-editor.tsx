/*
 * Copyright 2025 QuiTeeom <quiteeom@gmail.com>.
 * Author Github: https://github.com/QuiTeeom
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as monaco from 'monaco-editor';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {CaretRightFilled, SaveFilled} from "@ant-design/icons";
import {Button, Flex} from "antd";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {RunScript} from "../../wailsjs/go/main/App";
import {EventsOff, EventsOn} from "../../wailsjs/runtime";
import {useScriptStore} from "../store/scriptStore";
import {SaveScriptContent} from "../../wailsjs/go/api/Api";


// 设置 MonacoEnvironment
window.MonacoEnvironment = {
    getWorker(workerId: string, label: string): Promise<Worker> | Worker {
        if (label === 'json') {
            return new JsonWorker()
        }
        if (label === 'typescript' || label === 'javascript') {
            return new TsWorker()
        }
        return new TsWorker();
    }
};

const ScEditorWrapper = styled.div`
    height: 100%;
    width: 100%;
    overflow-y: hidden;
`;

const ToolBarWrapper = styled.div`
    height: 29px;
    background-color: #e4e4e4;
    border-bottom: #959595 solid 1px;
`
const ToolBarItemWrapper = styled.div`
    height: 100%;
    display: flex;
    padding: 0px 5px;
`

const MonacoEditorWrapper = styled.div`
    padding-top: 5px;
    height: calc( 100% - 30px - 5px );
    width: 100%;
`

export function ScEditor(
    props:{
        runnerWriter: (data:Uint8Array)=>void
        editor: React.MutableRefObject<IStandaloneCodeEditor|null>
    }
){
    const editor:React.MutableRefObject<null|IStandaloneCodeEditor> = useRef(null)
    const editorWrapper:React.MutableRefObject<HTMLDivElement|null> = useRef(null);

    const activeScript = useScriptStore(state=>state.activeScript)
    const activeScriptContext = useScriptStore(state=>state.activeScriptContext)

    useEffect(()=>{
        if (editor.current!=null) {
            return;
        }

        if (editorWrapper.current==null){
            return;
        }

        const newEditor = monaco.editor.create(editorWrapper.current,{
            language: "bat",
            automaticLayout: true,
        });

        editor.current = newEditor
        props.editor.current = newEditor
    })

    useEffect(() => {
        if (editor.current==null){
            return
        }
        editor.current.setValue(activeScriptContext)
    }, [activeScriptContext]);

    return (
        <ScEditorWrapper>
            <ToolBarWrapper>
                <Flex
                    gap="small"
                    style={{height:'100%'}}
                    align={"center"}
                >
                    <Flex>
                        <Button
                            icon={<SaveFilled/>}
                            size={"small"}
                            type={"text"}
                            onClick={async ()=>{
                                if (editor.current==null||activeScript==null||activeScript.id==null) {
                                    return
                                }
                                const value = editor.current.getValue();
                                console.log("保存内容",activeScript, value)
                                await SaveScriptContent(activeScript.id,value)
                            }}
                        >保存</Button>
                        <Button
                            icon={<CaretRightFilled />}
                            size={"small"}
                            type={"text"}
                            onClick={()=>{
                                const value = editor.current?.getValue();
                                console.log(value)
                                if (value==null){
                                    return
                                }
                                const eventName = new Date().getMilliseconds()+""
                                props.runnerWriter(Uint8Array.of(12))
                                EventsOn(eventName,function (data:number) {
                                    // const uint8Array = toByteArray(data);
                                    // console.log(JSON.stringify(new TextDecoder().decode(uint8Array)));
                                    props.runnerWriter(Uint8Array.of(data))
                                })
                                RunScript(eventName, value)
                                    .then(function (res) {
                                        console.log("完成")
                                        EventsOff(eventName)
                                        // props.runnerWriter(new TextEncoder().encode('ok'))
                                    })
                            }}
                        >运行</Button>
                    </Flex>
                </Flex>
            </ToolBarWrapper>
            <MonacoEditorWrapper id="monaco-editor" ref={editorWrapper} />
        </ScEditorWrapper>
    )
}
