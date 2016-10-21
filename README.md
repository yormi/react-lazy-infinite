# react-lazy-infinite

After trying [redux-infinite-scroll](https://github.com/RealScout/redux-infinite-scroll) and [react-infinite](https://github.com/seatgeek/react-infinite), I had to adapt them to fit my needs and I ended up starting over.

This module is a lot inspired on the work mention above. Thanks guys !

I decided to publish this in case someone find himself with the same use cases that I struggled with. If it doesn't fit your need, lookup [react-infinite](https://github.com/seatgeek/react-infinite) and [redux-infinite-scroll](https://github.com/RealScout/redux-infinite-scroll)

# Installation

`npm install --save react-lazy-infinite`

You also need a need a generator polyfill like `babel-polyfill`.

## Peer dependencies

### Version 15.x.x

* `react`
* `react-dom`
* `react-addons-pure-mixin`

# What is it ?

A solution for long scrollable lists with SAME-HEIGHT-items

# Features

* Lazy load/fetch/prepare the data with `props.fetchMore` when approaching the last item (given with the props totalNumberOfItems)
* Automatically calculated height
* For performance purposes, only the visible items and a few buffer items are rendered

# Limits

* All items must have the same height:
This is to allow the height to be automatically calculated. The height of the first item to be rendered is assume to be the same height than all the items.

# Props

## `containerStyle`

* PropTypes.object
* Inline style for the container

## `containerTypea`

* PropTypes.string
* Default to `'tbody'`
* The container of the items


## `hasMore`

* PropTypes.bool.isRequired
* Tells when to stop fetching

## `initialNumberOfItems`

* PropTypes.number
* Default to 15
* Since the height of the items can only be calculated once rendered, the initial render can not know how many items to render
* Once an item is rendered, `componentHeight / itemHeight` is used

## `loader`

* PropTypes.node.isRequired
* Element or component to render to let the user know it's fetching/loading

## `totalNumberOfItems`

* PropTypes.number.isRequired
* Number of items

## `fetchMore (numberOfVisibleItems)`

* PropTypes.func.isRequired
* Function to call to fetch more items for the initial fetch and the lazy-load fetch when approaching the bottom of the list

## `renderItems (fromIndex, toIndex)`

* PropTypes.func.isRequired
* Fonction to get the items component to render

# Example

```javascript
...
import InfiniteScroll from 'react-lazy-infinite'

class MyList extends React.Component {
  static propsType {
    fetchIngredients: PropTypes.func.isRequired,
    ingredients: PropTypes.array.isRequired,
    hasMoreIngredientsToFetch: PropTypes.bool.isRequired
  }

  render () {
    return (
      </table>
        <InfiniteScroll
          fetchMore={this.props.fetchIngredients}
          hasMore={this.props.hasMoreIngredientsToFetch}
          loader={<tr><td>Keep smiling, we're almost there...</td></tr>}
          renderItems={this.renderIngredientEntries}
          totalNumberOfItems={this.props.ingredients.length}
        />
      </table>
    )
  }

  renderIngredientEntries = (startIndex, endIndex) => {
    const ingredientsToDisplay = this.props.ingredients.slice(startIndex, endIndex + 1)
    const ingredientsEntries = ingredientsToDisplay.map(
      (i) => <IngredientEntry key={i.id} {...i} />
    )
    return ingredientsEntries
  }
}
```

# Contributions

Always welcome ! I'm sure you can help making this better :)
