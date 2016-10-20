/* global describe, beforeEach, it */

import assert from 'assert'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import React from 'react'

import InfiniteScroll, { BUFFER_SIZE } from '../src/infinite_scroll'

describe('Infinite Scroll', () => {
  const ITEMS_HEIGHT = 1
  const NUMBER_OF_VISIBLE_ITEMS = 3
  let infiniteScroll

  const fetchMore = sinon.spy(() => {
    setTimeout(0, () => infiniteScroll.setProps({ hasMore: false }))
  })
  const renderItemsSpy = sinon.spy()

  const renderItems = (fromIndex, toIndex) => {
    renderItemsSpy(fromIndex, toIndex)
    const items = []
    for (let i = fromIndex; i <= toIndex; i++) {
      items.push(<div key={i}>{'Item' + i}</div>
      )
    }

    return items
  }

  const DEFAULT_PROPS = {
    containerType: 'div',
    hasMore: true,
    initialNumberOfItems: 10,
    loader: <h2>Loading...</h2>,
    totalNumberOfItems: 20,

    fetchMore,
    renderItems
  }

  const DEFAULT_STATE = {
    numberOfVisibleItems: NUMBER_OF_VISIBLE_ITEMS,
    itemHeight: ITEMS_HEIGHT,
    scrollTop: 0
  }

  beforeEach(() => {
    DEFAULT_PROPS.fetchMore.reset()
    renderItemsSpy.reset()
  })

  const render = (modifiedProps = {}, renderFn = shallow) => {
    const props = {
      ...DEFAULT_PROPS,
      ...modifiedProps
    }

    infiniteScroll = renderFn(
      <InfiniteScroll {...props} />
    )

    return infiniteScroll
  }

  const setState = (infiniteScroll, relevantState = {}) => {
    const state = {
      ...DEFAULT_STATE,
      ...relevantState
    }

    infiniteScroll.setState(state)

    return state
  }

  describe('Render', () => {
    it('renders the number of items provided for the initial render', () => {
      render()
      sinon.assert.calledWithExactly(
        renderItemsSpy,
        0,
        DEFAULT_PROPS.initialNumberOfItems
      )
    })

    it('handles no items to render', () => {
      const infiniteScroll = render({ totalNumberOfItems: 0 })
      assert.strictEqual(infiniteScroll.children().length, 0)
    })

    it('keep looking for itemsHeight if there is no item on the first render', () => {
      const infiniteScroll = render({ totalNumberOfItems: 0 }, mount)
      const spy = sinon.spy(infiniteScroll.instance(), 'updateHeights')
      infiniteScroll.setState({ totalNumberOfItems: 2 })
      sinon.assert.calledOnce(spy)
    })

    it('renders only the number of visible items plus the bufferSize items after when at initial position', () => {
      const infiniteScroll = render()
      setState(infiniteScroll)

      const numberOfItemsToRender = NUMBER_OF_VISIBLE_ITEMS + BUFFER_SIZE
      sinon.assert.calledWithExactly(
        renderItemsSpy,
        0,
        numberOfItemsToRender - 1
      )
    })

    it('renders the number of visible items plus the bufferSize items before plus the ones after when it is at least a bufferSize scrolled down', () => {
      const scrollTop = BUFFER_SIZE * ITEMS_HEIGHT

      const infiniteScroll = render({ hasMore: false })
      setState(infiniteScroll, { scrollTop })

      const numberOfItemsToRender = NUMBER_OF_VISIBLE_ITEMS + 2 * BUFFER_SIZE
      sinon.assert.calledWithExactly(
        renderItemsSpy,
        0,
        numberOfItemsToRender - 1
      )
    })

    it('renders the number of visible items plus the bufferSize items after when it is completely scrolled down', () => {
      const infiniteScroll = render({ hasMore: false })
      scrollDown(infiniteScroll)

      const veryLastItemsIndex = DEFAULT_PROPS.totalNumberOfItems - 1
      const numberOfItemsToRender = NUMBER_OF_VISIBLE_ITEMS + BUFFER_SIZE
      sinon.assert.calledWithExactly(
        renderItemsSpy,
        DEFAULT_PROPS.totalNumberOfItems - numberOfItemsToRender,
        veryLastItemsIndex
      )
    })
  })

  it('calls fetchMore with the number of rendered items', () => {
    const infiniteScroll = render()
    scrollDown(infiniteScroll)
    sinon.assert.calledWithExactly(
      DEFAULT_PROPS.fetchMore,
      NUMBER_OF_VISIBLE_ITEMS
    )
  })

  it('calls fetchMore when reaching a distance scrollTop-veryBottom of numberOfVisibleItems * 2 + bufferSize', () => {
    const infiniteScroll = render()
    scrollDown(infiniteScroll, 2 * NUMBER_OF_VISIBLE_ITEMS + BUFFER_SIZE)
    sinon.assert.calledOnce(DEFAULT_PROPS.fetchMore)
  })

  it('calls fetchMore when reaching the bottom', () => {
    const infiniteScroll = render()
    scrollDown(infiniteScroll)
    assert(DEFAULT_PROPS.fetchMore.calledOnce)
  })

  it('does not call fetchMore when is already fetching', () => {
    const infiniteScroll = render()
    setState(infiniteScroll, { isFetching: true })
    scrollDown(infiniteScroll)
    sinon.assert.notCalled(DEFAULT_PROPS.fetchMore)
  })

  it('does not call fetchMore when hasMore is false', () => {
    const infiniteScroll = render({ hasMore: false })
    scrollDown(infiniteScroll)
    assert.strictEqual(DEFAULT_PROPS.fetchMore.callCount, 0)
  })

  it('displays the loader when loading more', () => {
    const infiniteScroll = render()
    setState(infiniteScroll, { isFetching: true })
    assert(infiniteScroll.contains(DEFAULT_PROPS.loader))
  })

  it('hides the loader when the loading is completed', async () => {
    const infiniteScroll = render()
    infiniteScroll.setState({ isFetching: false })
    assert.strictEqual(infiniteScroll.contains(DEFAULT_PROPS.loader), false)
  })

  const scrollDown = (infiniteScroll, distanceToBottom) => {
    const fullHeight = DEFAULT_PROPS.totalNumberOfItems * ITEMS_HEIGHT

    if (distanceToBottom) {
      const scrollTop = fullHeight - distanceToBottom
      setState(infiniteScroll, { scrollTop })
    } else {
      const visibleHeight = DEFAULT_STATE.numberOfVisibleItems * ITEMS_HEIGHT
      const scrollTop = fullHeight - visibleHeight
      setState(infiniteScroll, { scrollTop })
    }
  }
})
