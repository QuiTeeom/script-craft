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

import './App.css';
import React, {useRef} from "react";
import {ScEditor} from "./editor/sc-editor";
import {ConfigProvider, Splitter} from "antd";
import {ScTerm, Writer} from "./term/sc-term";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {IndexComp} from "./index";


function App() {

    const writer:React.MutableRefObject<null|Writer> = useRef(null)

    const editor:React.MutableRefObject<null|IStandaloneCodeEditor> = useRef(null)

    return (
        <div id="App">
            <ConfigProvider
            >
                <Splitter>
                    <Splitter.Panel collapsible={true} defaultSize="250" resizable={false}>
                        <IndexComp />
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <Splitter
                            layout={'vertical'}
                            style={{
                                height: '100vh'
                            }}
                        >
                            <Splitter.Panel>
                                <ScEditor
                                    runnerWriter={function (data:Uint8Array) {
                                        writer.current?.write(data)
                                    }}
                                    editor={editor}
                                />
                            </Splitter.Panel>
                            <Splitter.Panel collapsible={true} defaultSize="200" min="50" max="400">
                                <ScTerm
                                    writer={writer}
                                />
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                </Splitter>
            </ConfigProvider>
        </div>
    )
}

export default App
