import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';

const CardCollection = ({ items }) => {
  return (
    <Container>
      <Row>
        {items?.map((item) => (
          <Col key={item.id} sm={6} md={4} lg={3}>
            <Card>
            <Card.Header>{item.title}</Card.Header>
              <Card.Img variant="top" src={item.metadataURI} />
              <Card.Body>
                <Card.Text>{item.description}</Card.Text>
                <Button variant="primary">List</Button>
              </Card.Body>
              <ListGroup className="list-group-flush">
                <ListGroup.Item>Selling Price: {item.cost}  ETH</ListGroup.Item>
            </ListGroup>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CardCollection;
