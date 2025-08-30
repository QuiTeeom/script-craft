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

package logs

import (
	"fmt"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
)

var logger *zap.Logger

func Debug(msg string, fields ...zapcore.Field) {
	logger.Debug(msg, fields...)
}
func Debugf(format string, a ...any) {
	logger.Debug(fmt.Sprintf(format, a...))
}

func Info(msg string, fields ...zapcore.Field) {
	logger.Info(msg, fields...)
}
func Infof(format string, a ...any) {
	logger.Info(fmt.Sprintf(format, a...))
}

func Warn(msg string, fields ...zapcore.Field) {
	logger.Warn(msg, fields...)
}
func Warnf(format string, a ...any) {
	logger.Warn(fmt.Sprintf(format, a...))
}

func Error(msg string, fields ...zapcore.Field) {
	logger.Error(msg, fields...)
}
func Errorf(format string, a ...any) {
	logger.Error(fmt.Sprintf(format, a...))
}

func init() {
	// 控制台输出配置
	consoleWriter := zapcore.AddSync(os.Stdout)

	// 日志级别配置
	core := zapcore.NewTee(
		//zapcore.NewCore(
		//	zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig()),
		//	consoleWriter,
		//	zapcore.DebugLevel,
		//),
		zapcore.NewCore(
			zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig()),
			consoleWriter,
			zapcore.InfoLevel,
		),
	)

	logger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
	Info("初始化日志完成")
}
