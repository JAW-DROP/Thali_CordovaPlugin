//
//  Thali CordovaPlugin
//  AppStateNotificationsManagerTests.swift
//
//  Copyright (C) Microsoft. All rights reserved.
//  Licensed under the MIT license.
//  See LICENSE.txt file in the project root for full license information.
//

@testable import ThaliCore
import XCTest

class AppStateNotificationsManagerTests: XCTestCase {

  // MARK: - Setup & Teardown
  override func setUp() {
    super.setUp()
  }

  override func tearDown() {
    super.tearDown()
  }

  // MARK: - Tests
  func testWillEnterBackground() {
    var willEnterBackgroundCalled: Bool = false
    let manager = ApplicationStateNotificationsManager()
    manager.willEnterBackgroundHandler = {
      willEnterBackgroundCalled = true
    }
    NSNotificationCenter.defaultCenter().postNotificationName(
      UIApplicationWillResignActiveNotification,
      object: nil
    )
    XCTAssertTrue(willEnterBackgroundCalled)
  }

  func testDidEnterForeground() {
    var didEnterForegroundCalled: Bool = false
    let manager = ApplicationStateNotificationsManager()
    manager.didEnterForegroundHandler = {
      didEnterForegroundCalled = true
    }
    NSNotificationCenter.defaultCenter().postNotificationName(
      UIApplicationDidBecomeActiveNotification,
      object: nil
    )
    XCTAssertTrue(didEnterForegroundCalled)
  }
}
