import onElementResize from 'element-resize-event'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin'

export const BUFFER_SIZE = 2
export const DEFAULT_PROPS = {
  containerType: 'tbody',
  initialNumberOfItems: 15
}

export default class InfiniteScroll extends React.Component {
  static propTypes = {
    containerStyle: PropTypes.object,
    containerType: PropTypes.string,
    hasMore: PropTypes.bool.isRequired,
    initialNumberOfItems: PropTypes.number,
    loader: PropTypes.node.isRequired,
    totalNumberOfItems: PropTypes.number.isRequired,

    fetchMore: PropTypes.func.isRequired,
    renderItems: PropTypes.func.isRequired
  }

  static defaultProps = DEFAULT_PROPS

  constructor () {
    super()

    this.state = {
      itemHeight: undefined,
      fullHeight: undefined,
      isFetching: false,
      numberOfVisibleItems: undefined,
      scrollTop: 0,
      spacerType: undefined
    }

    this.shouldComponentUpdate = shouldComponentUpdate.bind(this)
  }

  componentDidMount () {
    this.isStillMounted = true
    onElementResize(this.container, this.updateHeights)
    this.extractItemsInfo()
  }

  componentWillUnmount () {
    this.isStillMounted = false
  }

  extractItemsInfo = () => {
    if (!this.state.itemHeight) {
      this.updateHeights()
    }

    if (!this.state.spacerType) {
      this.setSpacerType()
    }
  }

  updateHeights = () => {
    const itemHeight = this.firstItem ? this.firstItem.clientHeight : undefined
    const visibleHeight = this.container.clientHeight
    const numberOfVisibleItems = Math.ceil(visibleHeight / itemHeight)

    this.setState({
      itemHeight,
      fullHeight: this.props.totalNumberOfItems * itemHeight,
      numberOfVisibleItems
    })
  }

  setSpacerType () {
    if (this.firstItem) {
      const spacerType = this.firstItem.tagName
      this.setState({ spacerType })
    }
  }

  componentDidUpdate = () => {
    const lastRenderedIndex = this.getLastRenderedIndex()
    const currentVeryLastIndex = this.props.totalNumberOfItems - 1
    const distanceToBottom = currentVeryLastIndex - lastRenderedIndex

    const threshold = this.state.numberOfVisibleItems + BUFFER_SIZE
    if (distanceToBottom < threshold) {
      this.fetchMoreItems()
    }
    this.extractItemsInfo()
  }

  fetchMoreItems = async () => {
    if (!this.props.hasMore) return
    if (this.state.isFetching) return

    this.setState({ isFetching: true })
    await this.props.fetchMore(this.state.numberOfVisibleItems)
    if (this.isStillMounted) {
      this.setState({ isFetching: false })
    }
  }

  handleScroll = () => {
    if (this.scrollAnimationRequest) return

    if (window.requestAnimationFrame) {
      this.scrollAnimationRequest = window.requestAnimationFrame(() => {
        this.updateScrollPosition()
        this.scrollAnimationRequest = null
      })
    } else {
      this.updateScrollPosition()
    }
  }

  updateScrollPosition = () => {
    this.setState({
      scrollTop: this.container.scrollTop
    })
  }

  getFirstRenderedIndex () {
    const firstVisibleIndex = this.getFirstVisibleIndex()
    return Math.max(
      0,
      firstVisibleIndex - BUFFER_SIZE
    )
  }

  getLastRenderedIndex () {
    const { numberOfVisibleItems } = this.state

    if (!this.areHeightsReady()) return this.props.initialNumberOfItems

    const firstVisibleIndex = this.getFirstVisibleIndex()
    const lastVisibleIndex = firstVisibleIndex + numberOfVisibleItems - 1
    const lastBufferIndex = lastVisibleIndex + BUFFER_SIZE

    const veryLastIndex = this.props.totalNumberOfItems - 1
    return Math.min(veryLastIndex, lastBufferIndex)
  }

  getFirstVisibleIndex () {
    const {
      scrollTop,
      itemHeight
    } = this.state

    if (!this.areHeightsReady()) return 0

    return Math.floor(scrollTop / itemHeight)
  }

  areHeightsReady () {
    return !!this.state.itemHeight
  }

  render () {
    // Variable name has to have a capital letter as first letter to be well interpreted by JSX
    const ContainerType = this.props.containerType
    const containerProps = {
      ref: (c) => { this.container = ReactDOM.findDOMNode(c) },
      style: this.props.containerStyle,
      onScroll: this.handleScroll
    }

    if (!this.props.totalNumberOfItems) {
      return <ContainerType {...containerProps} />
    }

    const items = this.renderItems()
    const firstItem = React.cloneElement(
      items[0],
      { ref: (c) => { this.firstItem = ReactDOM.findDOMNode(c) } }
    )
    const restOfItems = items.slice(1)

    return (
      <ContainerType {...containerProps}>
        {this.renderAboveSpacer()}
        {firstItem}
        {restOfItems}
        {this.renderBottomSpacer()}
        {this.renderLoader()}
      </ContainerType>
    )
  }

  renderItems () {
    const fromIndex = this.getFirstRenderedIndex()
    const toIndex = this.getLastRenderedIndex()

    return this.props.renderItems(fromIndex, toIndex)
  }

  renderAboveSpacer () {
    const SpacerType = this.state.spacerType
    if (!SpacerType) return

    let height = 0

    if (this.areHeightsReady()) {
      const numberOfItemsToReplace = this.getFirstRenderedIndex()
      height = numberOfItemsToReplace * this.state.itemHeight
    }

    return <SpacerType style={{ height }} />
  }

  renderBottomSpacer () {
    const SpacerType = this.state.spacerType
    if (!SpacerType) return

    let height = 0

    if (this.areHeightsReady()) {
      const totalNumberOfItems = this.props.totalNumberOfItems
      const numberOfItemsBefore = this.getLastRenderedIndex() + 1
      const numberOfItemsToReplace = totalNumberOfItems - numberOfItemsBefore
      height = numberOfItemsToReplace * this.state.itemHeight
    }

    return <SpacerType style={{ height }} />
  }

  renderLoader () {
    if (this.state.isFetching) {
      return this.props.loader
    }
  }
}
