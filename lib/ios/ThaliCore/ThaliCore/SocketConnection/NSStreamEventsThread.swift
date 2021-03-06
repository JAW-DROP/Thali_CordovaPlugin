//
//  Thali CordovaPlugin
//  NSStreamEventsThread.swift
//
//  Copyright (C) Microsoft. All rights reserved.
//  Licensed under the MIT license.
//  See LICENSE.txt file in the project root for full license information.
//

import Foundation

class NSStreamEventsThread: NSThread {

    private let runLoopReadyGroup: dispatch_group_t
    private var _runLoop: NSRunLoop
    internal var runLoop: NSRunLoop {
        get {
            dispatch_group_wait(runLoopReadyGroup, DISPATCH_TIME_FOREVER)
            return _runLoop
        }
    }

    class var sharedInstance: NSStreamEventsThread {

        struct Static {

            static var instance: NSStreamEventsThread? = nil
            static var thread: NSStreamEventsThread? = nil
            static var onceToken: dispatch_once_t = 0
        }

        dispatch_once(&Static.onceToken) {
            Static.thread = NSStreamEventsThread()
            Static.thread?.name = "com.thaliproject.NSStreamEventsThread"
            Static.thread?.start()
        }

        return Static.thread!
    }

    override init() {
        _runLoop = NSRunLoop()
        runLoopReadyGroup = dispatch_group_create()
        dispatch_group_enter(runLoopReadyGroup)
    }

    override func main() {
        autoreleasepool {
            _runLoop = NSRunLoop.currentRunLoop()
            dispatch_group_leave(runLoopReadyGroup)

            // Prevent runloop from spinning
            var sourceCtx = CFRunLoopSourceContext(version: 0,
                                                   info: nil,
                                                   retain: nil,
                                                   release: nil,
                                                   copyDescription: nil,
                                                   equal: nil,
                                                   hash: nil,
                                                   schedule: nil,
                                                   cancel: nil,
                                                   perform: nil)

            let source = CFRunLoopSourceCreate(nil, 0, &sourceCtx)
            CFRunLoopAddSource(CFRunLoopGetCurrent(), source, kCFRunLoopDefaultMode)

            while _runLoop.runMode(NSDefaultRunLoopMode, beforeDate: NSDate.distantFuture()) {}
        }
    }
}
