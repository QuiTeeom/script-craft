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

package main

import (
	"app/backend/application"
	"app/backend/filerunner"
	"context"
	"github.com/labstack/gommon/log"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.uber.org/dig"
	"os"
	"os/exec"
	"path/filepath"
)

type App struct {
	ctx       context.Context
	container *dig.Container
}

type Writer struct {
	eventName string
	ctx       context.Context
}

func (w *Writer) Write(p []byte) (int, error) {
	for _, b := range p {
		runtime.EventsEmit(w.ctx, w.eventName, b)
	}

	return len(p), nil
}

func NewApp() *App {
	return &App{
		container: dig.New(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	application.Init(a.container)
}

func (a *App) RunScript(eventName, script string) {
	abs, err := filepath.Abs(eventName + ".bat")
	if err != nil {
		log.Error(err)
		return
	}
	log.Infof("文件地址%s", abs)
	scriptFile, err := os.Create(abs)
	if err != nil {
		log.Error(err)
		return
	}
	defer os.Remove(abs)
	log.Infof("打开文件")
	_, err = scriptFile.WriteString(script)
	if err != nil {
		log.Error(err)
		return
	}
	log.Infof("写入文件")
	scriptFile.Close()
	err = filerunner.Run(abs, func(cmd *exec.Cmd) {
		cmd.Stdout = &Writer{
			eventName: eventName,
			ctx:       a.ctx,
		}
	})
	if err != nil {
		log.Error(err)
		return
	}
}
