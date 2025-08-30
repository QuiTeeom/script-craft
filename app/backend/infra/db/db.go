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

package db

import (
	"app/backend/config"
	"app/backend/infra/logs"
	"github.com/dgraph-io/badger/v4"
	"go.uber.org/zap"
	"os"
	"sync"
)

var once sync.Once
var db *badger.DB

func NewDb() *badger.DB {

	once.Do(func() {
		logs.Info("初始化DB")
		homeData := config.GetWorkHomeData()
		options := badger.DefaultOptions(homeData + string(os.PathSeparator) + "db")
		options.WithLogger(&dbLogger{})
		ndb, err := badger.Open(options)
		if err != nil {
			logs.Error("初始化DB失败", zap.Error(err))
			os.Exit(10)
		}
		db = ndb
	})

	return db
}

type dbLogger struct {
}

func (d dbLogger) Errorf(s string, i ...interface{}) {
	logs.Errorf(s, i...)
}

func (d dbLogger) Warningf(s string, i ...interface{}) {
	logs.Warnf(s, i...)
}

func (d dbLogger) Infof(s string, i ...interface{}) {
	logs.Infof(s, i...)
}

func (d dbLogger) Debugf(s string, i ...interface{}) {
	logs.Debugf(s, i...)
}
