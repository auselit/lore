/*
 * This package is based on uwm.diagram.autolayout
 * 
 * Copyright (c) 2009 The Olympos Development Team.
 * 
 * http://sourceforge.net/projects/olympos/
 * 
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0 which
 * accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html. If redistributing this code, this
 * entire header must remain intact.
 * 
 */
/**
  * @namespace lore.ore.ui.graph.autolayout
  */
Ext.namespace("lore.ore.ui.graph.autolayout");
/**
 * @class lore.ore.ui.graph.autolayout.JiggleObject */
lore.ore.ui.graph.autolayout.JiggleObject = function() {
    this.booleanField = false;
    this.intField = 0;
    this.objectField = null;
    this.context = null;
}
Ext.apply(lore.ore.ui.graph.autolayout.JiggleObject.prototype, {
    /**
     * @return {}
     */
    getContext : function() {
        return this.context;
    },
    /**
     * @param {} c
     */
    setContext : function(c) {
        this.context = c;
    },
    /**
     * @param {} d
     * @return {}
     */
    square : function(d) {
        return d * d;
    },
    /**
     * 
     * @param {} d
     * @return {}
     */
    cube : function(d) {
        return d * d * d;
    },
    /**
     * 
     * @param {} n
     * @return {}
     */
    intSquare : function(n) {
        return n * n;
    },
    /**
     * 
     * @param {} base
     * @param {} d
     * @return {Number}
     */
    power : function(base, d) {
        if (d == 0)
            return 1;
        else if (d == 1)
            return base;
        else if (d % 2 == 0)
            return this.intSquare(this.power(base, d / 2));
        else
            return base * this.intSquare(this.power(base, d / 2));
    }
});

/**
 * @class lore.ore.ui.graph.autolayout.ForceLaw
 * @extends lore.ore.ui.graph.autolayout.JiggleObject
 * @param {} graph
 */
lore.ore.ui.graph.autolayout.ForceLaw = Ext.extend(lore.ore.ui.graph.autolayout.JiggleObject,{ 
    constructor: function(graph) {
        lore.ore.ui.graph.autolayout.JiggleObject.call(this);
        this.graph = graph;
        this.cap = Number.MAX_VALUE / 1000
    },
    
    /**
     * 
     * @return {}
     */
    getCap : function() {
        return this.cap;
    },
    /**
     * 
     * @param {} cap
     */
    setCap : function(cap) {
        this.cap = cap;
    }
});

/**
 * @class lore.ore.ui.graph.autolayout.SpringLaw
 * @extends lore.ore.ui.graph.autolayout.ForceLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 */
lore.ore.ui.graph.autolayout.SpringLaw = Ext.extend(lore.ore.ui.graph.autolayout.ForceLaw,{
    constructor: function(graph, preferredEdgeLength) {
        lore.ore.ui.graph.autolayout.ForceLaw.call(this, graph);
        this.preferredEdgeLength = preferredEdgeLength;
    },
    /**
     * 
     * @param {} negativeGradient
     */
    apply : function(negativeGradient) {
        var m = this.graph.numberOfEdges;
        var d = this.graph.getDimensions();
        for (var i = 0; i < m; i++) {
            var e = this.graph.edges.get(i);
            var from = e.getFrom();
            var to = e.getTo();
            var fromWeight = from.getWeight();
            var toWeight = to.getWeight();
            var f = from.intField;
            var t = to.intField;
            var w = Math.min(this.springAttraction(e), this.cap / e.getLength());
            var fromCoords = from.getCoords();
            var toCoords = to.getCoords();
            for (var j = 0; j < d; j++) {
                var force = (toCoords[j] - fromCoords[j]) * w;
                negativeGradient[f][j] += force * toWeight;
                negativeGradient[t][j] -= force * fromWeight;
            }
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.QuadraticSpringLaw
 * @extends lore.ore.ui.graph.autolayout.SpringLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 */
lore.ore.ui.graph.autolayout.QuadraticSpringLaw = Ext.extend(lore.ore.ui.graph.autolayout.SpringLaw,{
    constructor: function(graph, preferredEdgeLength) {
        lore.ore.ui.graph.autolayout.SpringLaw.call(this, graph, preferredEdgeLength);
    },
    /**
     * 
     * @param {} edge
     * @return {}
     */
    springAttraction : function(edge) {
        var r = lore.ore.ui.graph.autolayout.Cell.prototype.sumOfRadii(edge.getFrom(),
                edge.getTo());
        var len = edge.getLength();
        return (len - r) / this.preferredEdgeLength;
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw
 * @extends lore.ore.ui.graph.autolayout.ForceLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 */
lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw = Ext.extend(lore.ore.ui.graph.autolayout.ForceLaw,{
    constructor: function(graph, preferredEdgeLength) {
        lore.ore.ui.graph.autolayout.ForceLaw.call(this, graph);
        this.preferredEdgeLength = preferredEdgeLength;
        this.barnesHutTheta = 0;
    },
    /**
     * 
     * @return {}
     */
    getBarnesHutTheta : function() {
        return this.barnesHutTheta;
    },
    /**
     * 
     * @param {} t
     */
    setBarnesHutTheta : function(t) {
        this.barnesHutTheta = t;
    },
    /**
     * 
     * @param {} negativeGradient
     */
    apply : function(negativeGradient) {
        if (this.barnesHutTheta > 0) {
            this.applyUsingBarnesHut(negativeGradient);
        }
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        for (var i = 0; i < n - 1; i++) {
            var v1 = this.graph.vertices.get(i);
            var v1Coords = v1.getCoords();
            var weight1 = v1.getWeight();
            for (var j = i + 1; j < n; j++) {
                var v2 = this.graph.vertices.get(j);
                var w = Math.min(this.pairwiseRepulsion(v1, v2), this.cap
                                / lore.ore.ui.graph.autolayout.Vertex.prototype
                                        .getDistance(v1, v2));
                var v2Coords = v2.getCoords();
                var weight2 = v2.getWeight();
                for (var k = 0; k < d; k++) {
                    var force = (v1Coords[k] - v2Coords[k]) * w;
                    negativeGradient[i][k] += force * weight2;
                    negativeGradient[j][k] -= force * weight1;
                }
            }
        }
    },
    /**
     * 
     * @param {} negativeGradient
     */
    applyUsingBarnesHut : function(negativeGradient) {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        if (n <= 1)
            return;
        this.graph.recomputeBoundaries();
        var root = new lore.ore.ui.graph.autolayout.QuadTree(this.graph);
        for (var i = 0; i < n; i++) {
            var v = this.graph.vertices.get(i);
            var qt = v.getContext();
            var cur = qt;
            while (cur.getContext() != this.graph) {
                var p = cur.getContext();
                var numberOfSubtrees = this.power(2, d);
                for (var j = 0; j < numberOfSubtrees; j++) {
                    var st = p.subtrees[j];
                    if (cur != st) {
                        this.computeQTRepulsion(qt, st, negativeGradient);
                    }
                }
                cur = p;
            }
        }
        this.pushForcesDownTree(root);
        for (var i = 0; i < n; i++) {
            var v = this.graph.vertices.get(i);
            var qt = v.getContext();
            for (var j = 0; j < d; j++) {
                negativeGradient[i][j] += qt.force[j];
            }
            v.setContext(this.graph);
        }
    },
    /**
     * 
     * @param {} leaf
     * @param {} cell
     * @param {} negativeGradient
     */
    computeQTRepulsion : function(leaf, cell, negativeGradient) {
        if (cell == null)
            return;
        var d = leaf.getDimensions();
        if ((cell.objectField == null) && (!this.wellSeparated(leaf, cell))) {
            var numberOfSubtrees = this.power(2, d);
            for (var i = 0; i < numberOfSubtrees; i++) {
                this.computeQTRepulsion(leaf, cell.subtrees[i], negativeGradient);
            }
        } else {
            var w = Math.min(this.pairwiseRepulsion(leaf, cell), this.cap
                            / lore.ore.ui.graph.autolayout.Cell.prototype.getDistance(
                                    leaf, cell));
            var leafWeight = leaf.getWeight();
            var cellWeight = cell.getWeight();
            var leafCoords = leaf.getCoords();
            var cellCoords = cell.getCoords();
            var i = leaf.intField;
            for (var j = 0; j < d; j++) {
                var force = 0.5 * w * (leafCoords[j] - cellCoords[j]);
                negativeGradient[i][j] += force * cellWeight;
                cell.force[j] -= force * leafWeight;
            }
        }
    },
    /**
     * 
     * @param {} leaf
     * @param {} cell
     * @return {Boolean}
     */
    wellSeparated : function(leaf, cell) {
        if (cell == null)
            throw new Error("cell == null");
        if (cell.objectField != null)
            return true;
        else {
            var d = cell.getDimensions();
            var len = Number.MAX_VALUE;
            var lo = cell.getMin();
            var hi = cell.getMax();
            for (var i = 0; i < d; i++) {
                len = Math.min(len, hi[i] - lo[i]);
            }
            var dist = lore.ore.ui.graph.autolayout.Cell.prototype
                    .getDistance(leaf, cell);
            return ((len / dist) < this.barnesHutTheta);
        }
    },
    /**
     * 
     * @param {} qt
     */
    pushForcesDownTree : function(qt) {
        if ((qt != null) && (qt.objectField == null) && (qt.getWeight() > 0)) {
            var d = qt.getDimensions();
            var numberOfSubtrees = this.power(2, d);
            for (var i = 0; i < numberOfSubtrees; i++) {
                for (var j = 0; j < d; j++) {
                    qt.subtrees[i].force[j] += qt.force[j];
                }
            }
            for (var i = 0; i < numberOfSubtrees; i++) {
                this.pushForcesDownTree(qt.subtrees[i]);
            }
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.HybridVertexVertexRepulsionLaw
 * @extends lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 */
lore.ore.ui.graph.autolayout.HybridVertexVertexRepulsionLaw = Ext.extend(lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw, { 
    constructor: function(graph,
            preferredEdgeLength) {
        lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw.call(this, graph,
                preferredEdgeLength);
    },
    /**
     * 
     * @param {} c1
     * @param {} c2
     * @return {}
     */
    pairwiseRepulsion : function(c1, c2) {
        var r = lore.ore.ui.graph.autolayout.Cell.prototype.sumOfRadii(c1, c2);
        var k = this.preferredEdgeLength + r;
        var dSquared = lore.ore.ui.graph.autolayout.Cell.prototype.getDistanceSquared(c1,
                c2);
        if (dSquared < k * k) {
            return k * k / dSquared;
        } else {
            return this.cube(k
                    / lore.ore.ui.graph.autolayout.Cell.prototype.getDistance(c1, c2));
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.ForceModel
 * @param {} graph
 */
lore.ore.ui.graph.autolayout.ForceModel = function(graph) {
        this.graph = graph;
        this.preferredEdgeLength = 0;
        this.forceLaws = new draw2d.ArrayList();
        this.constraints = new draw2d.ArrayList();
}
    /**
     * 
     * @return {}
     */
Ext.apply(lore.ore.ui.graph.autolayout.ForceModel.prototype, {
    getPreferredEdgeLength : function() {
        return this.preferredEdgeLength;
    },
    /**
     * 
     * @param {} k
     */
    setPreferredEdgeLength : function(k) {
        this.preferredEdgeLength = k;
    },
    /**
     * 
     * @param {} fl
     */
    addForceLaw : function(fl) {
        this.forceLaws.add(fl);
    },
    /**
     * 
     * @param {} fl
     */
    removeForceLaw : function(fl) {
        this.forceLaws.remove(fl);
    },
    /**
     * 
     * @param {} c
     */
    addConstraint : function(c) {
        this.constraints.add(c);
    },
    /**
     * 
     * @param {} c
     */
    removeConstraint : function(c) {
        this.constraints.remove(c);
    },
    /**
     * 
     * @param {} negativeGradient
     */
    getNegativeGradient : function(negativeGradient) {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < d; j++) {
                negativeGradient[i][j] = 0;
            }
            this.graph.vertices.get(i).intField = i;
        }
        for (var i = 0; i < this.forceLaws.getSize(); i++) {
            var law = this.forceLaws.get(i);
            law.apply(negativeGradient);
        }
    },
    /**
     * 
     * @param {} penaltyVector
     */
    getPenaltyVector : function(
            penaltyVector) {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < d; j++) {
                penaltyVector[i][j] = 0;
            }
            this.graph.vertices.get(i).intField = i;
        }
        for (var i = 0; i < this.constraints.getSize(); i++) {
            var constraint = this.constraints.get(i);
            constraint.apply(penaltyVector);
        }
    }
});
/**
 *@class lore.ore.ui.graph.autolayout.Constraint
 *@extends lore.ore.ui.graph.autolayout.JiggleObject
 * @param {} graph
 */
lore.ore.ui.graph.autolayout.Constraint = Ext.extend(lore.ore.ui.graph.autolayout.JiggleObject, {
    constructor: function(graph) {
        lore.ore.ui.graph.autolayout.JiggleObject.call(this);
        this.graph = graph;
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.ProjectionConstraint
 * @extends lore.ore.ui.graph.autolayout.Constraint
 * @param {} graph
 * @param {} dimensions
 */
lore.ore.ui.graph.autolayout.ProjectionConstraint = Ext.extend(lore.ore.ui.graph.autolayout.Constraint,{
    constructor: function(graph, dimensions) {
        lore.ore.ui.graph.autolayout.Constraint.call(this, graph);
        this.dimensions = dimensions;
    },
    /**
     * @param {} penalty
     */
    apply : function(penalty) {
        var d = this.graph.getDimensions();
        var n = this.graph.numberOfVertices;
        for (var i = 0; i < n; i++) {
            var coords = this.graph.vertices.get(i).getCoords();
            for (var j = this.dimensions; j < d; j++) {
                penalty[i][j] += (-coords[j]);
            }
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.ForceDirectedOptimizationProcedure
 * @extends lore.ore.ui.graph.autolayout.JiggleObject
 * @param {} graph
 * @param {} fm
 */
lore.ore.ui.graph.autolayout.ForceDirectedOptimizationProcedure = Ext.extend(lore.ore.ui.graph.autolayout.JiggleObject, {
    constructor: function(graph, fm) {
        lore.ore.ui.graph.autolayout.JiggleObject.call(this);
        this.graph = graph;
        this.forceModel = fm;
        this.constrained = false;
    },
    /**
     * 
     * @return {}
     */
    getConstrained : function() {
        return this.constrained;
    },
    /**
     * 
     * @param {} c
     */
    setConstrained : function(c) {
        this.constrained = c;
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure
 * @extends lore.ore.ui.graph.autolayout.ForceDirectedOptimizationProcedure
 * @param {} graph
 * @param {} fm
 * @param {} accuracy
 */
lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure = Ext.extend(lore.ore.ui.graph.autolayout.ForceDirectedOptimizationProcedure, {
    constructor: function(graph, fm, accuracy) {
        lore.ore.ui.graph.autolayout.ForceDirectedOptimizationProcedure.call(this, graph,
                fm);
        this.maxCos = accuracy;
        this.negativeGradient = null;
        this.descentDirection = null;
        this.penaltyVector = null;
        this.penaltyFactor = 0;
        this.stepSize = 0.1;
        this.previousStepSize = 0;
    },
    /**
     * 
     * @return {}
     */
    improveGraph : function() {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        if ((this.negativeGradient == null) || (this.negativeGradient.length != n)) {
            this.negativeGradient = new Array();
            this.penaltyVector = new Array();
            for (var i = 0; i < n; i++) {
                this.negativeGradient[i] = new Array();
                this.penaltyVector[i] = new Array();
            }
            this.getNegativeGradient();
        }
        this.computeDescentDirection();
        return this.lineSearch();
    },
    /**
     * 
     */
    reset : function() {
        this.negativeGradient = null;
        this.penaltyFactor = 0;
    },
    /**
     * 
     */
    computePenaltyFactor : function() {
        var m1 = this.l2Norm(this.negativeGradient);
        var m2 = this.l2Norm(this.penaltyVector);
        if (m2 == 0) {
            this.penaltyFactor = 0;
        } else if (m1 == 0) {
            this.penaltyFactor = 1;
        } else {
            var cos = this.dotProduct(this.negativeGradient, this.penaltyVector)
                    / (m1 * m2);
            var penaltyFactor = Math.max(0.00000001, (0.00000001 - cos))
                    * Math.max(1, (m1 / m2));
        }
    },
    /**
     * 
     */
    getNegativeGradient : function() {
        this.forceModel.getNegativeGradient(this.negativeGradient);
        if (this.constrained) {
            this.getPenaltyVector();
            this.computePenaltyFactor();
            var n = this.graph.numberOfVertices;
            var d = this.graph.getDimensions();
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < d; j++) {
                    this.negativeGradient[i][j] += this.penaltyFactor
                            * this.penaltyVector[i][j];
                }
            }
        }
    },
    /**
     * 
     */
    getPenaltyVector : function() {
        this.forceModel.getPenaltyVector(this.penaltyVector);
    },
    /**
     * 
     * @return {Number}
     */
    lineSearch : function() {
        this.previousStepSize = 0;
        var n = this.graph.numberOfVertices;
        var magDescDir = this.l2Norm(this.descentDirection);
        if (magDescDir < 0.0001) {
            return 0;
        }
        var magLo = this.l2Norm(this.negativeGradient);
        this.step();
        this.getNegativeGradient();
        var magHi = this.l2Norm(this.negativeGradient);
        var m = magDescDir * magHi;
        var cos = this.dotProduct(this.negativeGradient, this.descentDirection) / m;
        var lo = 0;
        var hi = Number.MAX_VALUE;
        var i = 0;
        while (((cos < 0) || (cos > this.maxCos)) && (hi - lo > 0.00000001)) {
            if (cos < 0) {
                hi = this.stepSize;
                this.stepSize = (lo + hi) / 2;
            } else {
                if (hi < Number.MAX_VALUE) {
                    lo = this.stepSize;
                    this.stepSize = (lo + hi) / 2;
                } else {
                    lo = this.stepSize;
                    this.stepSize *= 2;
                }
            }
            this.step();
            this.getNegativeGradient();
            m = magDescDir * this.l2Norm(this.negativeGradient);
            cos = this.dotProduct(this.negativeGradient, this.descentDirection) / m;
        }
        return this.l2Norm(this.negativeGradient);
    },
    /**
     * 
     */
    step : function() {
        var n = this.graph.numberOfVertices;
        var s = this.stepSize - this.previousStepSize;
        for (var i = 0; i < n; i++) {
            this.graph.vertices.get(i).translate(s, this.descentDirection[i]);
        }
        this.previousStepSize = this.stepSize;
    },
    /**
     * 
     * @param {} u
     * @param {} v
     * @return {}
     */
    dotProduct : function(
            u, v) {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        var sum = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < d; j++) {
                sum += u[i][j] * v[i][j];
            }
        }
        return sum;
    },
    /**
     * 
     * @param {} vect
     * @return {}
     */
    l2Norm : function(
            vect) {
        return Math.sqrt(this.dotProduct(vect, vect));
    },
    /**
     * 
     * @param {} vect
     * @return {}
     */
    lInfinityNorm : function(
            vect) {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        var max = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < d; j++) {
                max = Math.max(max, Math.abs(vect[i][j]));
            }
        }
        return max;
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.ConjugateGradients
 * @extends lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure
 * @param {} graph
 * @param {} fm
 * @param {} accuracy
 * @param {} restartThreshold
 */
lore.ore.ui.graph.autolayout.ConjugateGradients = Ext.extend(lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure, {
    constructor: function(graph, fm, accuracy,
            restartThreshold) {
        lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure.call(this, graph,
                fm, accuracy);
        this.magnitudeOfPreviousGradientSquared = null;
        this.previousDescentDirection = null;
        this.restartThreshold = 0;
        if (restartThreshold) {
            this.restartThreshold = restartThreshold;
        }
    },
    /**
     * 
     */
    reset : function() {
        this.negativeGradient = null;
        this.descentDirection = null;
    },
    /**
     * 
     */
    computeDescentDirection : function() {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        var magnitudeOfCurrentGradientSquared = 0;
        if ((this.descentDirection == null) || (this.descentDirection.length != n)) {
            this.descentDirection = new Array();
            this.previousDescentDirection = new Array();
            for (var i = 0; i < n; i++) {
                this.descentDirection[i] = new Array();
                this.previousDescentDirection[i] = new Array();
                for (var j = 0; j < d; j++) {
                    var temp = this.negativeGradient[i][j];
                    this.descentDirection[i][j] = temp;
                    magnitudeOfCurrentGradientSquared += this.square(temp);
                }
            }
        } else {
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < d; j++) {
                    var temp = this.negativeGradient[i][j];
                    magnitudeOfCurrentGradientSquared += this.square(temp);
                }
            }
            if (magnitudeOfCurrentGradientSquared < 0.000001) {
                for (var i = 0; i < n; i++) {
                    for (var j = 0; j < d; j++) {
                        this.previousDescentDirection[i][j] = 0;
                        this.descentDirection[i][j] = 0;
                    }
                }
                return;
            }
            var w = magnitudeOfCurrentGradientSquared
                    / this.magnitudeOfPreviousGradientSquared;
            var dotProduct = 0;
            var magnitudeOfDescentDirectionSquared = 0;
            var m;
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < d; j++) {
                    this.descentDirection[i][j] = this.negativeGradient[i][j] + w
                            * this.previousDescentDirection[i][j];
                    dotProduct += this.descentDirection[i][j]
                            * this.negativeGradient[i][j];
                    magnitudeOfDescentDirectionSquared += this
                            .square(this.descentDirection[i][j]);
                }
            }
            m = magnitudeOfCurrentGradientSquared
                    * magnitudeOfDescentDirectionSquared;
            if (dotProduct / Math.sqrt(m) < this.restartThreshold) {
                this.descentDirection = null;
                this.computeDescentDirection();
                return;
            }
        }
        this.magnitudeOfPreviousGradientSquared = magnitudeOfCurrentGradientSquared;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < d; j++) {
                this.previousDescentDirection[i][j] = this.descentDirection[i][j];
            }
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.Cell
 * @extends lore.ore.ui.graph.autolayout.JiggleObject
 */
lore.ore.ui.graph.autolayout.Cell = Ext.extend(lore.ore.ui.graph.autolayout.JiggleObject,{
    constructor: function() {
        lore.ore.ui.graph.autolayout.JiggleObject.call(this);
        this.dimensions = 2;
        this.weight = 0;
        this.coords = null;
        this.min = null;
        this.max = null;
        this.size = null;
        this.setDimensions(2);
    },
    /**
     * 
     * @return {}
     */
    getWeight : function() {
        return this.weight;
    },
    /**
     * 
     * @param {} w
     */
    setWeight : function(w) {
        this.weight = w;
    },
    /**
     * 
     * @return {}
     */
    getDimensions : function() {
        return this.dimensions;
    },
    /**
     * 
     * @param {} d
     */
    setDimensions : function(d) {
        this.dimensions = d;
        this.coords = new Array();
        this.size = new Array();
        this.min = new Array();
        this.max = new Array();
    },
    /**
     * 
     * @return {}
     */
    getCoords : function() {
        return this.coords;
    },
    /**
     * 
     * @param {} c
     */
    setCoords : function(c) {
        for (var i = 0; i < this.dimensions; i++) {
            this.coords[i] = c[i];
        }
    },
    /**
     * 
     * @return {}
     */
    getMin : function() {
        return this.min;
    },
    /**
     * 
     * @param {} c
     */
    setMin : function(c) {
        for (var i = 0; i < this.dimensions; i++) {
            this.min[i] = c[i];
        }
        this.recomputeSize();
    },
    /**
     * 
     * @return {}
     */
    getMax : function() {
        return this.max;
    },
    /**
     * 
     * @param {} c
     */
    setMax : function(c) {
        for (var i = 0; i < this.dimensions; i++) {
            this.max[i] = c[i];
        }
        this.recomputeSize();
    },
    /**
     * 
     */
    recomputeSize : function() {
        for (var i = 0; i < this.dimensions; i++) {
            this.size[i] = this.max[i] - this.min[i];
        }
    },
    /**
     * 
     * @return {}
     */
    getSize : function() {
        return this.size;
    },
    /**
     * 
     * @param {} c
     */
    setSize : function(c) {
        for (var i = 0; i < this.dimensions; i++) {
            this.size[i] = c[i];
        }
        this.recomputeBoundaries();
    },
    /**
     * 
     */
    recomputeBoundaries : function() {
        for (var i = 0; i < this.dimensions; i++) {
            this.min[i] = this.coords[i] - this.size[i] / 2;
            this.max[i] = this.coords[i] + this.size[i] / 2;
        }
    }
});
/**
 * 
 * @param {} scalar
 * @param {} vector
 */
lore.ore.ui.graph.autolayout.Cell.prototype.translate = function(scalar, vector) {
        if (!vector) {
            scalar = vector;
            scalar = 1;
        }
        for (var i = 0; i < this.dimensions; i++) {
            var translation = scalar * vector[i];
            this.coords[i] += translation;
            this.min[i] += translation;
            this.max[i] += translation;
        }
}
Ext.apply(lore.ore.ui.graph.autolayout.Cell.prototype, {
    /**
     * 
     * @param {} c1
     * @param {} c2
     * @return {}
     */
    getDistanceSquared : function(c1, c2) {
        var sum = 0;
        var d = c1.getDimensions();
        for (var i = 0; i < d; i++)
            sum += this.square(c1.coords[i] - c2.coords[i]);
        return sum;
    },
    /**
     * 
     * @param {} cell
     * @param {} point
     * @return {}
     */
    getDistanceSquaredPoint : function(cell,
            point) {
        var sum = 0;
        var d = cell.getDimensions();
        for (var i = 0; i < d; i++)
            sum += this.square(cell.coords[i] - point[i]);
        return sum;
    },
    /**
     * 
     * @param {} c1
     * @param {} c2
     * @return {}
     */
    getDistance : function(c1, c2) {
        return Math.sqrt(this.getDistanceSquared(c1, c2));
    },
    /**
     * 
     * @param {} cell
     * @param {} point
     * @return {}
     */
    getDistancePoint : function(cell, point) {
        return Math.sqrt(this.getDistanceSquaredPoint(cell, point));
    },
    /**
     * 
     * @param {} c1
     * @param {} c2
     * @return {}
     */
    sumOfRadii : function(c1, c2) {
        var d = c1.getDimensions();
        var coords1 = c1.getCoords();
        var coords2 = c2.getCoords();
        var seg = new Array();
        for (var i = 0; i < d; i++) {
            seg[i] = coords2[i] - coords1[i];
        }
        return this.radiusSegment(d, c1.getSize(), seg)
                + this.radiusSegment(d, c2.getSize(), seg);
    },
    /**
     * 
     * @param {} cell
     * @param {} point
     * @return {}
     */
    radius : function(cell, point) {
        var d = cell.getDimensions();
        var coords = cell.getCoords();
        var seg = new Array();
        for (var i = 0; i < d; i++) {
            seg[i] = point[i] - coords[i];
        }
        return this.radiusSegment(d, cell.getSize(), seg);
    },
    /**
     * 
     * @param {} d
     * @param {} cellSize
     * @param {} segment
     * @return {Number}
     */
    radiusSegment : function(d, cellSize,
            segment) {
        var sum = 0;
        for (var i = 0; i < d; i++) {
            sum += cellSize[i];
        }
        if (sum == 0) {
            return 0;
        }
        var t = Number.MAX_VALUE;
        for (var i = 0; i < d; i++) {
            t = Math.min(t, Math.abs(cellSize[i] / segment[i]));
        }
        var lengthSquared = 0;
        for (var i = 0; i < d; i++) {
            lengthSquared += this.square(t * segment[i]);
        }
        return Math.sqrt(lengthSquared) / 2;
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.QuadTree
 * @extends lore.ore.ui.graph.autolayout.Cell
 * @param {} graph
 * @param {} max
 * @param {} parent
 */
lore.ore.ui.graph.autolayout.QuadTree = Ext.extend(lore.ore.ui.graph.autolayout.Cell,{
    constructor: function(graph, max, parent) {
        lore.ore.ui.graph.autolayout.Cell.call(this);
        this.objectField = null;
        this.subtrees = new Array();
        var d;
        if (!max) {
            this.setContext(graph);
            d = graph.getDimensions();
            this.setDimensions(d);
            var n = graph.numberOfVertices;
            this.setMin(graph.getMin());
            this.setMax(graph.getMax());
            for (var i = 0; i < n; i++) {
                graph.vertices.get(i).objectField = null;
            }
            for (var i = 0; i < n; i++) {
                this.insert(graph.vertices.get(i));
            }
        } else {
            this.setContext(parent);
            d = parent.getDimensions();
            this.setDimensions(d);
            this.setMin(graph);
            this.setMax(max);
        }
        this.force = new Array();
        for (var i = 0; i < d; i++) {
            this.force[i] = 0;
        }
    },
    
    /**
     * 
     * @param {} v
     * @return {}
     */
    lookUp : function(v) {
        if (this.objectField == v) {
            return this;
        } else if (this.objectField != null) {
            return null;
        } else {
            return this.subtrees[this.getIndex(v)].lookUp(v);
        }
    },
    /**
     * 
     * @param {} v
     * @return {}
     */
    getIndex : function(v) {
        var c = v.getCoords();
        var center = this.getCenter();
        var d = this.getDimensions();
        var index = 0
        var column = 1;
        for (var i = 0; i < d; i++) {
            if (c[i] > center[i]) {
                index += column;
            }
            column *= 2;
        }
        return index;
    },
    /**
     * 
     * @return {}
     */
    getCenter : function() {
        var d = this.getDimensions();
        var mp = new Array();
        var lo = this.getMin();
        var hi = this.getMax();
        for (var i = 0; i < d; i++) {
            mp[i] = (lo[i] + hi[i]) / 2;
        }
        return mp;
    },
    /**
     * Empty
     */
    recomputeSize : function() {
    },
    /**
     * Empty
     */
    recomputeBoundaries : function() {
    },
    /**
     * 
     * @param {} v
     */
    insert : function(v) {
        var w = this.getWeight();
        var vw = v.getWeight();
        var d = this.getDimensions();
        var vCoords = v.getCoords();
        var vSize = v.getSize();
        if (w == 0) {
            v.setContext(this);
            this.setWeight(v.getWeight());
            this.setCoords(vCoords);
            this.setSize(v.getSize());
            this.objectField = v;
            return;
        }
        if (this.objectField != null) {
            this.splitCell();
        }
        var c = this.getCoords();
        var s = this.getSize();
        for (var i = 0; i < d; i++) {
            c[i] = (c[i] * w + vCoords[i] * vw) / (w + vw);
            s[i] = (s[i] * w + vSize[i] * vw) / (w + vw);
        }
        this.setWeight(w + vw);
        this.subtrees[this.getIndex(v)].insert(v);
    },
    /**
     * 
     */
    splitCell : function() {
        var v = this.objectField;
        this.objectField = null;
        var cellMin = this.getMin();
        var cellMax = this.getMax();
        var center = this.getCenter();
        var d = this.getDimensions();
        var n = this.power(2, d);
        var lo = new Array();
        var hi = new Array();
        for (var index = 0; index < n; index++) {
            var column = 1;
            for (var i = 0; i < d; i++) {
                if ((index & column) > 0) {
                    lo[i] = center[i];
                    hi[i] = cellMax[i];
                } else {
                    lo[i] = cellMin[i];
                    hi[i] = center[i];
                }
                column *= 2;
            }
            this.subtrees[index] = new lore.ore.ui.graph.autolayout.QuadTree(lo, hi, this);
        }
        this.subtrees[this.getIndex(v)].insert(v);
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.Vertex
 * @extends.lore.ore.ui.graph.autolayout.Cell
 * @param {} graph
 */
lore.ore.ui.graph.autolayout.Vertex = Ext.extend(lore.ore.ui.graph.autolayout.Cell,{
    constructor: function(graph) {
        lore.ore.ui.graph.autolayout.Cell.call(this);
        this.undirectedDegree = 0;
        this.inDegree = 0
        this.outDegree = 0;
        this.undirectedEdges = new draw2d.ArrayList();
        this.inEdges = new draw2d.ArrayList();
        this.outEdges = new draw2d.ArrayList();
        this.undirectedNeighbors = new draw2d.ArrayList();
        this.inNeighbors = new draw2d.ArrayList();
        this.outNeighbors = new draw2d.ArrayList();
        this.name = "";
        this.fixed = false;
        this.setContext(graph);
        this.setWeight(1);
        this.setDimensions(graph.getDimensions());
    },   
    /**
     * 
     * @return {string}
     */
    getName : function() {
        return this.name;
    },
    /**
     * 
     * @param {string} str
     */
    setName : function(str) {
        this.name = str;
    },
    /**
     * 
     * @return {}
     */
    getFixed : function() {
        return this.fixed;
    },
    /**
     * 
     * @param {} f
     */
    setFixed : function(f) {
        this.fixed = f;
    },
    /**
     * 
     * @param {} e
     */
    insertNeighbor : function(e) {
        var from = e.getFrom();
        var to = e.getTo();
        var v = null;
        if (this == from) {
            v = to;
        } else if (this == to) {
            v = from;
        } else {
            throw new lore.ore.ui.graph.autolayout.Error(e + " not incident to " + this);
        }
        if (!e.getDirected()) {
            this.undirectedEdges.add(e);
            this.undirectedNeighbors.add(v);
            this.undirectedDegree++;
        } else if (this == from) {
            this.outEdges.add(e);
            this.outNeighbors.add(to);
            this.outDegree++;
        } else {
            this.inEdges.add(e);
            this.inNeighbors.add(from);
            this.inDegree++;
        }
    },
    /**
     * 
     * @param {} e
     */
    deleteNeighbor : function(e) {
        var from = e.getFrom();
        var to = e.getTo();
        var v = null;
        if (this == from) {
            v = to;
        } else if (this == to) {
            v = from;
        } else {
            throw new lore.ore.ui.graph.autolayout.Error(e + " not incident to " + this);
        }
        try {
            if (!e.getDirected()) {
                this.undirectedEdges.remove(e);
                this.undirectedNeighbors.remove(v);
                this.undirectedDegree--;
            } else if (this == from) {
                this.outEdges.remove(e);
                this.outNeighbors.remove(to);
                this.outDegree--;
            } else {
                this.inEdges.remove(e);
                this.inNeighbors.remove(from);
                this.inDegree--;
            }
        } catch (exc) {
            throw new lore.ore.ui.graph.autolayout.Error(e + " not incident to " + this);
        }
    },
    /**
     * 
     * @return {}
     */
    toString : function() {
        return "(Vertex: " + this.name + ")";
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.Edge
 * @extends lore.ore.ui.graph.autolayout.JiggleObject
 * @param {} graph
 * @param {} from
 * @param {} to
 * @param {} directed
 */
lore.ore.ui.graph.autolayout.Edge = Ext.extend(lore.ore.ui.graph.autolayout.JiggleObject,{
    constructor: function(graph, from, to, directed) {
        lore.ore.ui.graph.autolayout.JiggleObject.call(this);
        this.from = from;
        this.to = to;
        this.label = null;
        this.directed = false;
        if (directed) {
            this.directed = directed;
        }
        this.preferredLength = 0;
        this.setContext(graph);
    },
    /**
     * 
     * @return {}
     */
    getFrom : function() {
        return this.from;
    },
    /**
     * 
     * @return {}
     */
    getTo : function() {
        return this.to;
    },
    /**
     * 
     * @return {}
     */
    getLabel : function() {
        return this.label;
    },
    /**
     * 
     * @param {} lbl
     */
    setLabel : function(lbl) {
        this.label = lbl;
    },
    /**
     * 
     * @return {}
     */
    getDirected : function() {
        return this.directed;
    },
    /**
     * 
     * @param {} d
     */
    setDirected : function(d) {
        this.directed = d;
    },
    /**
     * 
     * @return {}
     */
    getPreferredLength : function() {
        return this.preferredLength;
    },
    /**
     * 
     * @param {} len
     */
    setPreferredLength : function(len) {
        this.preferredLength = len;
    },
    /**
     * 
     * @return {}
     */
    getLengthSquared : function() {
        return lore.ore.ui.graph.autolayout.Vertex.prototype.getDistanceSquared(
                this.from, this.to);
    },
    /**
     * 
     * @return {}
     */
    getLength : function() {
        return lore.ore.ui.graph.autolayout.Vertex.prototype.getDistance(this.from,
                this.to);
    },
    /**
     * 
     * @return {}
     */
    toString : function() {
        return "(Edge: " + this.from + ", " + this.to + ", "
                + (this.directed ? "directed" : "undirected") + ")";
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.EdgeLabel
 * @extends lore.ore.ui.graph.autolayout.Cell
 * @param {} edge
 * @param {} name
 */
lore.ore.ui.graph.autolayout.EdgeLabel = Ext.extend(lore.ore.ui.graph.autolayout.Cell,{
    constructor: function(edge, name) {
        lore.ore.ui.graph.autolayout.Cell.call(this);
        this.name = name;
        this.setContext(e)
    }, 
    /**
     * 
     * @return {}
     */
    getName : function() {
        return this.name;
    },
    /**
     * 
     * @param {} str
     */
    setName : function(str) {
        this.name = str;
    },
    /**
     * 
     * @return {}
     */
    toString : function() {
        return "(EdgeLabel: " + this.name + ")";
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.Graph
 * @param {} dimensions
 */
lore.ore.ui.graph.autolayout.Graph = Ext.extend(lore.ore.ui.graph.autolayout.Cell, {
    constructor: function(dimensions) {
        lore.ore.ui.graph.autolayout.Cell.call(this);
        this.numberOfVertices = 0;
        this.numberOfMarkedVertices = 0;
        this.numberOfEdges = 0;
        this.vertices = new draw2d.ArrayList();
        this.edges = new draw2d.ArrayList();
        if (dimensions) {
            this.setDimensions(dimensions);
        }
    },
    /**
     * @return {}
     */
    insertVertex : function() {
        var v = new lore.ore.ui.graph.autolayout.Vertex(this);
        this.vertices.add(v);
        this.numberOfVertices++;
        return v;
    },
    /**
     * 
     * @param {} from
     * @param {} to
     * @param {} dir
     * @return {}
     */
    insertEdge : function(from, to, dir) {
        if (!dir) {
            dir = false;
        }
        var e = new lore.ore.ui.graph.autolayout.Edge(this, from, to, dir);
        from.insertNeighbor(e);
        to.insertNeighbor(e);
        this.edges.add(e);
        this.numberOfEdges++;
        return e;
    },
    /**
     * 
     * @param {} v
     */
    deleteVertex : function(v) {
        try {
            for (var i = 0; i < v.inDegree; i++) {
                var e = v.undirectedEdges.get(i);
                v.undirectedNeighbors.get(i).deleteNeighbor(e);
                this.edges.remove(e);
                this.numberOfEdges--;
            }
            for (var i = 0; i < v.inDegree; i++) {
                var e = v.inEdges.get(i);
                v.inNeighbors.get(i).deleteNeighbor(e);
                this.edges.remove(e);
                this.numberOfEdges--;
            }
            for (var i = 0; i < v.outDegree; i++) {
                var e = v.outEdges.get(i);
                v.outNeighbors.get(i).deleteNeighbor(e);
                this.edges.remove(e);
                this.numberOfEdges--;
            }
            this.vertices.remove(v);
            this.numberOfVertices--;
        } catch (exc) {
            throw new lore.ore.ui.graph.autolayout.Error(v + " not found");
        }
    },
    /**
     * 
     * @param {} e
     */
    deleteEdge : function(e) {
        try {
            e.getFrom().deleteNeighbor(e);
            e.getTo().deleteNeighbor(e);
            this.edges.remove(e);
            this.numberOfEdges--;
        } catch (exc) {
            throw new lore.ore.ui.graph.autolayout.Error(e + " not found");
        }
    },
    /**
     * 
     */
    recomputeBoundaries : function() {
        var d = this.getDimensions();
        var lo = this.getMin();
        var hi = this.getMax();
        for (var i = 0; i < d; i++) {
            lo[i] = Number.MAX_VALUE;
            hi[i] = -Number.MAX_VALUE;
        }
        for (var i = 0; i < this.numberOfVertices; i++) {
            var v = this.vertices.get(i);
            var c = v.getCoords();
            for (var j = 0; j < d; j++) {
                lo[j] = Math.min(lo[j], c[j]);
                hi[j] = Math.max(hi[j], c[j]);
            }
        }
        this.recomputeSize();
    },
    /**
     * 
     * @return {Boolean}
     */
    isConnected : function() {
        if (this.numberOfVertices == 0) {
            return false;
        }
        for (var i = 0; i < this.numberOfVertices; i++) {
            this.vertices.get(i).booleanField = false;
        }
        this.numberOfMarkedVertices = 0;
        this.dft(vertices.get(0));
        return (this.numberOfMarkedVertices == this.numberOfVertices);
    },
    /**
     * 
     * @param {} v
     */
    dft : function(v) {
        v.booleanField = true;
        ++this.numberOfMarkedVertices;
        for (var i = 0; i < v.undirectedDegree; i++) {
            var neighbor = v.undirectedNeighbors.get(i);
            if (!neighbor.booleanField) {
                this.dft(neighbor);
            }
        }
        for (var i = 0; i < v.undirectedDegree; i++) {
            var neighbor = v.inNeighbors.get(i);
            if (!neighbor.booleanField) {
                this.dft(neighbor);
            }
        }
        for (var i = 0; i < v.undirectedDegree; i++) {
            var neighbor = v.outNeighbors.get(i);
            if (!neighbor.booleanField) {
                this.dft(neighbor);
            }
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw
 * @extends lore.ore.ui.graph.autolayout.ForceLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 * @param {} strength
 */
lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw = Ext.extend(lore.ore.ui.graph.autolayout.ForceLaw, {
    constructor: function(graph,
            preferredEdgeLength, strength) {
        lore.ore.ui.graph.autolayout.ForceLaw.call(this, graph);
        this.preferredEdgeLength = preferredEdgeLength;
        this.strength = 1;
        this.gridding = false;
        if (strength) {
            this.strength = strength;
        }
    },
    /**
     * 
     * @return {}
     */
    getGridding : function() {
        return gridding;
    },
    /**
     * 
     * @param {} b
     */
    setGridding : function(
            b) {
        this.gridding = b;
    },
    /**
     * 
     * @param {} negativeGradient
     */
    apply : function(
            negativeGradient) {
        if (this.gridding) {
            this.applyUsingGridding(negativeGradient);
        }
        var n = this.graph.numberOfVertices;
        var m = this.graph.numberOfEdges;
        var d = this.graph.getDimensions();
        for (var i = 0; i < n; i++) {
            var v = this.graph.vertices.get(i);
            for (var j = 0; j < m; j++) {
                var e = this.graph.edges.get(j);
                var from = e.getFrom();
                var to = e.getTo();
                this.computeRepulsion(v, e, negativeGradient);
            }
        }
    },
    /**
     * 
     * @param {} negativeGradient
     */
    applyUsingGridding : function(
            negativeGradient) {
        this.graph.recomputeBoundaries();
        var n = this.graph.numberOfVertices;
        var m = this.graph.numberOfEdges;
        var d = this.graph.getDimensions();
        var gridSize = new Array();
        var drawingArea = this.graph.getSize();
        var k = this.preferredEdgeLength;
        for (var i = 0; i < d; i++) {
            gridSize[i] = parseInt(drawingArea[i] / k) + 1;
        }
        var grid = new draw2d.ArrayList();
        var gMin = this.graph.getMin();
        var index = new Array();
        var sign = new Array();
        for (var i = 0; i < n; i++) {
            var v = this.graph.vertices.get(i);
            var c = v.getCoords();
            for (var j = 0; j < d; j++) {
                index[j] = parseInt((c[j] - gMin[j]) / k);
            }
            var gridCell = grid.get(index);
            if (gridCell == null) {
                grid.insertElementAt(new draw2d.ArrayList(), index);
            } else {
                gridCell.add(v);
            }
            v.objectField = index;
        }
        for (var i = 0; i < m; i++) {
            var e = this.graph.edges.get(i);
            var from = e.getFrom();
            var to = e.getTo();
            var fCoords = from.getCoords();
            var tCoords = to.getCoords();
            for (var j = 0; j < d; j++) {
                if (fCoords[j] < tCoords[j]) {
                    sign[j] = 1;
                } else if (fCoords[j] > tCoords[j]) {
                    sign[j] = -1;
                } else {
                    sign[j] = 0;
                }
            }
            var current = from.objectField;
            var numberOfAdjs = this.power(3, d);
            var flag = true;
            while (flag || (!this.equal(current, to.objectField))) {
                flag = false;
                for (var adj = 0; adj < numberOfAdjs; adj++) {
                    var temp = adj;
                    var doSecondPart = true;
                    for (var j = 0; j < d; j++) {
                        index[j] = current[j] + (temp % 3) - 1;
                        if ((index[j] < 0) || (index[j] >= gridSize[j])) {
                            doSecondPart = false
                            temp /= 3;
                        }
                    }
                    if (doSecondPart) {
                        var gridCell = grid.get(index);
                        if ((gridCell != null) && (!gridCell.booleanField)) {
                            for (var en = 0; en < gridCell.length; en++) {
                                var v = gridCell[en];
                                this.computeRepulsion(v, e, negativeGradient);
                            }
                            gridCell.booleanField = true;
                        }
                    }
                }
                var time;
                var minTime = Number.MAX_VALUE;
                var nextAxis = 0;
                for (var axis = 0; axis < d; axis++) {
                    if (sign[axis] == 0) {
                        continue;
                    }
                    if (sign[axis] == 1) {
                        time = (current[axis] + 1) * k
                                / (tCoords[axis] - fCoords[axis]);
                    } else {
                        time = current[axis] * k / (fCoords[axis] - tCoords[axis]);
                    }
                    if (time < minTime) {
                        minTime = time;
                        nextAxis = axis;
                    }
                }
                current[nextAxis] += sign[nextAxis];
            }
        }
    },
    /**
     * 
     * @param {} u
     * @param {} v
     * @return {Boolean}
     */
    equal : function(u, v) {
        var d = u.length;
        for (var i = 0; i < d; i++) {
            if (u[i] != v[i]) {
                return false;
            }
        }
        return true;
    },
    /**
     * 
     * @param {} v
     * @param {} e
     * @param {} negativeGradient
     */
    computeRepulsion : function(
            v, e, negativeGradient) {
        var from = e.getFrom();
        var to = e.getTo();
        if ((from == v) || (to == v)) {
            return;
        }
        var d = v.getDimensions();
        var vCoords = v.getCoords();
        var fCoords = from.getCoords();
        var tCoords = to.getCoords();
        var dp = 0;
        var lenSquared;
        for (var i = 0; i < d; i++) {
            dp += (vCoords[i] - fCoords[i]) * (tCoords[i] - fCoords[i]);
        }
        if (dp <= 0) {
            this.computeRepulsionVertex(v, from, negativeGradient);
        } else if (dp >= (lenSquared = e.getLengthSquared())) {
            this.computeRepulsionVertex(v, to, negativeGradient);
        } else {
            var len = Math.sqrt(lenSquared);
            var alpha = dp / len;
            var pCoords = new Array();
            for (var i = 0; i < d; i++) {
                pCoords[i] = (1 - alpha) * fCoords[i] + alpha * tCoords[i];
            }
            var w = Math.min(this.strength
                            * this.pairwiseRepulsionCoords(v, pCoords), this.cap
                            / lore.ore.ui.graph.autolayout.Vertex.prototype
                                    .getDistancePoint(v, pCoords));
            if (w == 0) {
                return;
            }
            var vWeight = v.getWeight();
            var fWeight = from.getWeight();
            var tWeight = to.getWeight();
            for (var i = 0; i < d; i++) {
                var force1 = (vCoords[i] - fCoords[i]) * w * (1 - alpha);
                var force2 = (vCoords[i] - tCoords[i]) * w * alpha;
                negativeGradient[v.intField][i] += force1 * fWeight;
                negativeGradient[from.intField][i] -= force1 * vWeight;
                negativeGradient[v.intField][i] += force2 * tWeight;
                negativeGradient[to.intField][i] -= force2 * vWeight;
            }
        }
    },
    /**
     * 
     * @param {} v1
     * @param {} v2
     * @param {} negativeGradient
     */
    computeRepulsionVertex : function(
            v1, v2, negativeGradient) {
        var d = v1.getDimensions();
        var w = Math.min(this.strength * this.pairwiseRepulsion(v1, v2), this.cap
                        / lore.ore.ui.graph.autolayout.Vertex.prototype.getDistance(v1,
                                v2));
        if (w == 0) {
            return;
        }
        var v1Coords = v1.getCoords();
        var weight1 = v1.getWeight();
        var v2Coords = v2.getCoords();
        var weight2 = v2.getWeight();
        for (var i = 0; i < d; i++) {
            var force = (v1Coords[i] - v2Coords[i]) * w;
            negativeGradient[v1.intField][i] += force * weight2;
            negativeGradient[v2.intField][i] -= force * weight1;
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.InverseSquareVertexEdgeRepulsionLaw
 * @extends lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 * @param {} strength
 */
lore.ore.ui.graph.autolayout.InverseSquareVertexEdgeRepulsionLaw = Ext.extend(lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw, {
    constructor: function(graph,
            preferredEdgeLength, strength) {
        if (!strength) {
            strength = 1;
        }
        lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw.call(this, graph,
                preferredEdgeLength, strength);
    },
    /**
     * 
     * @param {} c1
     * @param {} c2
     * @return {Number}
     */
    pairwiseRepulsion : function(
            c1, c2) {
        var k = this.preferredEdgeLength
                + lore.ore.ui.graph.autolayout.Cell.prototype.sumOfRadii(c1, c2);
        var d = lore.ore.ui.graph.autolayout.Cell.prototype.getDistance(c1, c2);
        if (d >= k) {
            return 0;
        } else {
            return this.cube(k / d) - k / d;
        }
    },
    /**
     * 
     * @param {} cell
     * @param {} coords
     * @return {Number}
     */
    pairwiseRepulsionCoords : function(
            cell, coords) {
        var k = this.preferredEdgeLength
                + lore.ore.ui.graph.autolayout.Cell.prototype.radius(cell, coords);
        var d = lore.ore.ui.graph.autolayout.Cell.prototype
                .getDistancePoint(cell, coords);
        if (d >= k) {
            return 0;
        } else {
            return this.cube(k / d) - k / d;
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.InverseSquareVertexVertexRepulsionLaw
 * @extends lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 */
lore.ore.ui.graph.autolayout.InverseSquareVertexVertexRepulsionLaw = Ext.extend(lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw, {
    constructor: function(graph,
            preferredEdgeLength) {
        lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw.call(this, graph,
                preferredEdgeLength);
    },
    /**
     * 
     * @param {} c1
     * @param {} c2
     * @return {}
     */
    pairwiseRepulsion : function(
            c1, c2) {
        var k = this.preferredEdgeLength
                + lore.ore.ui.graph.autolayout.Cell.prototype.sumOfRadii(c1, c2);
        return this.cube(k
                / lore.ore.ui.graph.autolayout.Cell.prototype.getDistance(c1, c2));
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.InverseVertexEdgeRepulsionLaw
 * @extends lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 * @param {} strength
 */
lore.ore.ui.graph.autolayout.InverseVertexEdgeRepulsionLaw = Ext.extend(lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw, {
    constructor: function(graph,
            preferredEdgeLength, strength) {
        if (!strength) {
            strength = 1;
        }
        lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw.call(this, graph,
                preferredEdgeLength, strength);
    },
    /**
     * 
     * @param {} c1
     * @param {} c2
     * @return {Number}
     */
    pairwiseRepulsion : function(
            c1, c2) {
        var k = this.preferredEdgeLength
                + lore.ore.ui.graph.autolayout.Cell.prototype.sumOfRadii(c1, c2);
        var dSquared = lore.ore.ui.graph.autolayout.Cell.prototype.getDistanceSquared(c1,
                c2);
        if (dSquared >= this.square(k)) {
            return 0;
        } else {
            return k * k / dSquared - k / Math.sqrt(dSquared);
        }
    },
    /**
     * 
     * @param {} cell
     * @param {} coords
     * @return {Number}
     */
    pairwiseRepulsionCoords : function(
            cell, coords) {
        var k = this.preferredEdgeLength
                + lore.ore.ui.graph.autolayout.Cell.prototype.radius(cell, coords);
        var dSquared = lore.ore.ui.graph.autolayout.Cell.prototype
                .getDistanceSquaredPoint(cell, coords);
        if (dSquared >= this.square(k)) {
            return 0;
        } else {
            return k * k / dSquared - k / Math.sqrt(dSquared);
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.InverseVertexVertexRepulsionLaw 
 * @extends lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 */
lore.ore.ui.graph.autolayout.InverseVertexVertexRepulsionLaw = Ext.extend(lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw, {
    constructor: function(graph,
            preferredEdgeLength) {
        lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw.call(this, graph,
                preferredEdgeLength);
    },
    /**
     * @param {} c1
     * @param {} c2
     * @return {}
     */
    pairwiseRepulsion : function(
            c1, c2) {
        var k = this.preferredEdgeLength
                + lore.ore.ui.graph.autolayout.Cell.prototype.sumOfRadii(c1, c2);
        return k * k
                / lore.ore.ui.graph.autolayout.Cell.prototype.getDistanceSquared(c1, c2);
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.LinearSpringLaw
 * @extends lore.ore.ui.graph.autolayout.SpringLaw
 * @param {} graph
 * @param {} preferredEdgeLength
 */
lore.ore.ui.graph.autolayout.LinearSpringLaw = Ext.extend(lore.ore.ui.graph.autolayout.SpringLaw, {
    constructor: function(graph, preferredEdgeLength) {
        lore.ore.ui.graph.autolayout.SpringLaw.call(this, graph, preferredEdgeLength);
    },
    /**
     * 
     * @param {} e
     * @return {Number}
     */
    springAttraction : function(e) {
        var r = lore.ore.ui.graph.autolayout.Cell.prototype.sumOfRadii(e.getFrom(), e
                        .getTo());
        if (r == 0) {
            return 1;
        } else {
            return 1 - r / e.getLength();
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.StandardForceModel
 * @extends lore.ore.ui.graph.autolayout.ForceModel
 * @param {} graph
 * @param {} preferredEdgeLength
 * @param {} theta
 */
lore.ore.ui.graph.autolayout.StandardForceModel = function(graph, preferredEdgeLength, theta) {
    lore.ore.ui.graph.autolayout.ForceModel.call(this, graph);
    this.preferredEdgeLength = preferredEdgeLength;
    var springLaw = new lore.ore.ui.graph.autolayout.QuadraticSpringLaw(graph,
            preferredEdgeLength);
    var vvRepulsionLaw = new lore.ore.ui.graph.autolayout.HybridVertexVertexRepulsionLaw(
            graph, preferredEdgeLength);
    this.addForceLaw(springLaw);
    this.addForceLaw(vvRepulsionLaw);
    this.addConstraint(new lore.ore.ui.graph.autolayout.ProjectionConstraint(graph, 2));
}
/**
 * @class lore.ore.ui.graph.autolayout.SteepestDescent
 * @extends lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure
 * @param {} graph
 * @param {} fm
 * @param {} accuracy
 */
lore.ore.ui.graph.autolayout.SteepestDescent = Ext.extend(lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure,{
    constructor: function(graph, fm, accuracy) {
        lore.ore.ui.graph.autolayout.FirstOrderOptimizationProcedure.call(this, graph,
                fm, accuracy);
    },
    /**
     * 
     */
    computeDescentDirection : function() {
        var n = this.graph.numberOfVertices;
        var d = this.graph.getDimensions();
        if ((this.descentDirection == null) || (this.descentDirection.length != n)) {
            this.descentDirection = new Array();
            for (var i = 0; i < n; i++) {
                this.descentDirection[i] = new Array();
            }
        }
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < d; j++) {
                this.descentDirection[i][j] = this.negativeGradient[i][j];
            }
        }
    }
});
/**
 * @class lore.ore.ui.graph.autolayout.Layouter
 * @param {} workflow
 */
lore.ore.ui.graph.autolayout.Layouter = function(workflow) {
    this.workflow = workflow;
    this.dimensions = 2;
    this.preferredEdgeLength = 100;
    this.optimizationProcedure = lore.ore.ui.graph.autolayout.Layouter.opt.CONJUGATE_GRADIENTS;
    this.lineSearchAccuracy = 0.5;
    this.cgRestartThreshold = 0.2;
    this.springs = lore.ore.ui.graph.autolayout.Layouter.spring.QUADRATIC;
    this.vertexVertexRepulsion = lore.ore.ui.graph.autolayout.Layouter.vvRepulsion.INVERSE_SQUARE;
    this.gridding = false;
    this.barnesHut = false;
    this.theta = 0.9;
    this.iterations = 25;
}
/** ConjugateGradients or SteepestDescent */
lore.ore.ui.graph.autolayout.Layouter.opt = {
    CONJUGATE_GRADIENTS : lore.ore.ui.graph.autolayout.ConjugateGradients,
    STEEPEST_DESCENT : lore.ore.ui.graph.autolayout.SteepestDescent
};
/** Quadratic or Linear */
lore.ore.ui.graph.autolayout.Layouter.spring = {
    QUADRATIC : lore.ore.ui.graph.autolayout.QuadraticSpringLaw,
    LINEAR : lore.ore.ui.graph.autolayout.LinearSpringLaw
};
/** Inverse Square, Inverse, Hybrid, Inverse Square Edge or Inverse Edge */
lore.ore.ui.graph.autolayout.Layouter.vvRepulsion = {
    INVERSE_SQUARE : lore.ore.ui.graph.autolayout.InverseSquareVertexVertexRepulsionLaw,
    INVERSE : lore.ore.ui.graph.autolayout.InverseVertexVertexRepulsionLaw,
    HYBRID : lore.ore.ui.graph.autolayout.HybridVertexVertexRepulsionLaw,
    INVERSE_SQUARE_EDGE : lore.ore.ui.graph.autolayout.InverseSquareVertexEdgeRepulsionLaw,
    INVERSE_EDGE : lore.ore.ui.graph.autolayout.InverseVertexEdgeRepulsionLaw
}
Ext.apply(lore.ore.ui.graph.autolayout.Layouter.prototype, {
    /**
     * 
     * @return {}
     */
    getDimensions : function() {
        return this.dimensions;
    },
    /**
     * 
     * @param {} d
     */
    setDimenstion : function(d) {
        this.dimensions = d;
    },
    /**
     * 
     * @return {}
     */
    getPreferredEdgeLength : function() {
        return this.preferredEdgeLength;
    },
    /**
     * 
     * @param {} k
     */
    setPreferredEdgeLength : function(k) {
        this.preferredEdgeLength = k;
    },
    /**
     * 
     * @return {}
     */
    getOptimizationProcedure : function() {
        return this.optimizationProcedure;
    },
    /**
     * 
     * @param {} o
     */
    setOptimizationProcedure : function(o) {
        this.optimizationProcedure = o;
    },
    /**
     * 
     * @return {}
     */
    getLineSearchAccuracy : function() {
        return this.lineSearchAccuracy;
    },
    /**
     * 
     * @param {} l
     */
    setLineSearchAccuracy : function(l) {
        this.lineSearchAccuracy = l;
    },
    /**
     * 
     * @return {}
     */
    getCgRestartThreshold : function() {
        return this.cgRestartThreshold;
    },
    /**
     * 
     * @param {} c
     */
    setCgRestartThreshold : function(c) {
        this.cgRestartThreshold = c;
    },
    /**
     * 
     * @return {}
     */
    getSprings : function() {
        return this.springs;
    },
    /**
     * 
     * @param {} s
     */
    setSprings : function(s) {
        this.springs = s;
    },
    /**
     * 
     * @return {}
     */
    getVertexVertexRepulsion : function() {
        return this.vertexVertexRepulsion;
    },
    /**
     * 
     * @param {} v
     */
    setVertexVertexRepulsion : function(v) {
        this.vertexVertexRepulsion = v;
    },
    /**
     * 
     * @return {}
     */
    getGridding : function() {
        return this.gridding;
    },
    /**
     * 
     * @param {} u
     */
    setGridding : function(u) {
        this.gridding = u;
    },
    /**
     * 
     * @return {}
     */
    getBarnesHut : function() {
        return this.barnesHut;
    },
    /**
     * 
     * @param {} b
     */
    setBarnesHut : function(b) {
        this.barnesHut = b;
    },
    /**
     * 
     * @return {}
     */
    getTheta : function() {
        return this.theta;
    },
    /**
     * 
     * @param {} t
     */
    setTheta : function(t) {
        this.theta = t;
    },
    /**
     * 
     * @return {}
     */
    getIterations : function() {
        return this.iterations;
    },
    /**
     * 
     * @param {} i
     */
    setIterations : function(i) {
        this.iterations = i;
    },
    /**
     * 
     */
    doLayout : function() {
        this.setupGraph();
        this.setupAndExecuteOptimization();
        this.moveFigures();
    },
    /**
     * 
     */
    setupGraph : function() {
        this.graph = new lore.ore.ui.graph.autolayout.Graph(this.dimensions);
        this.graph.setSize([this.workflow.getWidth(), this.workflow.getHeight()]);
        var workflowFigures = this.workflow.getFigures();
        this.figures = new draw2d.ArrayList();
        for (var i = 0; i < workflowFigures.getSize(); i++) {
            var currFigure = workflowFigures.get(i);
            // modified for lore: removed check for figure type
            this.figures.add(currFigure);
        }
        this.vertexes = new draw2d.ArrayList();
        for (var i = 0; i < this.figures.getSize(); i++) {
            var figure = this.figures.get(i);
            var vertex = this.graph.insertVertex();
            vertex.setName(figure.getId());
            vertex.setCoords([figure.getX(), figure.getY()]);
            vertex.setSize([figure.getWidth(), figure.getHeight()]);
            this.vertexes.add(vertex);
        }
        var clusterIds = new Array();
        var nextClusterId = 1;
        var clusters = new Array();
        for (var i = 0; i < this.figures.getSize(); i++) {
            if (!clusterIds[i]) {
                this.walkAndPopulateClusters(i, clusterIds, nextClusterId);
                nextClusterId++;
            }
            var figure = this.figures.get(i);
            var ports = figure.getPorts();
            var numConnections = 0;
            for (var j = 0; j < ports.getSize(); j++) {
                var port = ports.get(j);
                var connections = port.getConnections();
                for (var k = 0; k < connections.getSize(); k++) {
                    numConnections++;
                    var connection = connections.get(k);
                    if (connection.getSource() == port) {
                        var from = this.vertexes.get(i);
                        var targetPort = connection.getTarget();
                        var targetFigure = targetPort.getParent();
                        var targetIndex = this.figures.indexOf(targetFigure);
                        var to = this.vertexes.get(targetIndex)
                        var edge = this.graph.insertEdge(from, to, true);
                    }
                }
            }
            var clustersEntry = clusters[clusterIds[i]];
            if (clustersEntry) {
                if (clustersEntry.maxConnections < numConnections) {
                    clustersEntry.maxConnections = numConnections;
                    clustersEntry.vertex = this.vertexes.get(i);
                }
            } else {
                clusters[clusterIds[i]] = {
                    maxConnections : numConnections,
                    vertex : this.vertexes.get(i)
                };
            }
        }
        for (var i = 1; i < clusters.length; i++) {
            if (i != 1) {
                var from = clusters[i - 1].vertex;
                var to = clusters[i].vertex;
                var edge = this.graph.insertEdge(from, to, false);
            } else {
                var from = clusters[clusters.length - 1].vertex;
                var to = clusters[1].vertex;
                var edge = this.graph.insertEdge(from, to, false);
            }
        }
    },
    /**
     * 
     */
    setupAndExecuteOptimization : function() {
        var springLaw = new this.springs(this.graph, this.preferredEdgeLength);
        var vvRepulsionLaw = new this.vertexVertexRepulsion(this.graph,
                this.preferredEdgeLength);
        if (vvRepulsionLaw instanceof lore.ore.ui.graph.autolayout.VertexVertexRepulsionLaw
                && this.barnesHut) {
            vvRepulsionLaw.setBarnesHutTheta(this.theta);
        }
        if (vvRepulsionLaw instanceof lore.ore.ui.graph.autolayout.VertexEdgeRepulsionLaw) {
            vvRepulsionLaw.setGridding(this.gridding);
        }
        var forceModel = new lore.ore.ui.graph.autolayout.ForceModel(this.graph);
        forceModel.addForceLaw(springLaw);
        forceModel.addForceLaw(vvRepulsionLaw);
        if (this.dimensions > 0) {
            forceModel
                    .addConstraint(new lore.ore.ui.graph.autolayout.ProjectionConstraint(
                            this.graph, this.dimensions));
        }
        var opt = new this.optimizationProcedure(this.graph, forceModel,
                this.lineSearchAccuracy, this.cgRestartThreshold);
        for (var i = 0; i < this.iterations; i++) {
            opt.improveGraph();
        }
    },
    /**
     * 
     */
    moveFigures : function() {
        for (var i = 0; i < this.vertexes.getSize(); i++) {
            var vertex = this.vertexes.get(i);
            var figure = this.figures.get(i);
            var coords = vertex.getCoords();
            var command = new draw2d.CommandMove(figure);
            command.setPosition(parseInt(coords[0]), parseInt(coords[1]));
            this.workflow.getCommandStack().execute(command);
        }
    },
    /**
     * 
     * @param {} index
     * @param {} clusterIds
     * @param {} thisClusterId
     */
    walkAndPopulateClusters : function(
            index, clusterIds, thisClusterId) {
        var figure = this.figures.get(index);
        if (!clusterIds[index]) {
            clusterIds[index] = thisClusterId;
            var ports = figure.getPorts();
            for (var j = 0; j < ports.getSize(); j++) {
                var port = ports.get(j);
                var connections = port.getConnections();
                for (var k = 0; k < connections.getSize(); k++) {
                    var connection = connections.get(k);
                    if (connection.getSource() == port) {
                        var targetPort = connection.getTarget();
                        var targetFigure = targetPort.getParent();
                        var targetIndex = this.figures.indexOf(targetFigure);
                        this.walkAndPopulateClusters(targetIndex, clusterIds,
                                thisClusterId);
                    } else {
                        var sourcePort = connection.getSource();
                        var sourceFigure = sourcePort.getParent();
                        var sourceIndex = this.figures.indexOf(sourceFigure);
                        this.walkAndPopulateClusters(sourceIndex, clusterIds,
                                thisClusterId);
                    }
                }
            }
        }
    }
});